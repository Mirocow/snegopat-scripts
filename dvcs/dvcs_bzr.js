$engine JScript
$uname dvcs_bzr
$dname Backend dvcs � bzr
$addin global

// (c) ����� ������� shenja at sosna.zp.ua
// ������ - Backend � bzr ��� ����������� ����������� ��������. 

global.connectGlobals(SelfScript)

// ���� �� ���������� fso, ���������� � ������� � c:\windows\system32 
// regsvr32.exe scrrun.dll 
// ����� ����� fso ����������. �� ���� �������� ���������� ����� http://social.technet.microsoft.com/Forums/ru/windowsserverru/thread/28d55900-145b-466b-93d4-74e08006c72f
var FSO = new ActiveXObject("Scripting.FileSystemObject");

var WshShell = new ActiveXObject("WScript.Shell");
var TempDir = WshShell.ExpandEnvironmentStrings("%temp%") + "\\";
var mainFolder = profileRoot.getValue("Snegopat/MainFolder")

var ��������������������������� = [];

var PathToOutput = TempDir + "bzrstatus.txt" // ����� 1� ���� � utf-8, ������� ���� ������ fossil ����� ����� ������ ���. 
var PathToBat = TempDir + "bzrTrue.bat"

function bzr_getRootCatalog(path){
    var result = "";
    for (var key in ���������������������������){
        if (path.indexOf(key)!=-1) {
            result = key
            break
        }
    }
    if (result==undefined) {
        var f = v8New("File", path);
        if (f.Exist()) {
            
            var TextDoc = v8New("TextDocument");
            TextDoc.��������(PathToOutput, "UTF-8");
            ��������� = f.Path;
            TextDoc.AddLine('cd /d"' +��������� +'"')
            TextDoc.AddLine('bzr info >> "'+PathToOutput+'"');
            TextDoc.Write(PathToBat, 'cp866');
            ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
            TextDoc.Read(PathToOutput, "UTF-8");
            if (TextDoc.LineCount() == 0) {
                return "" //��� �� ����� �� ���. 
            }
        
            var i=0;
            for (var i=1; i<=TextDoc.LineCount(); i++)
            {
                var r = TextDoc.GetLine(i);
                re = new RegExp(/.*root:\s(.*)/);
                var mathes = r.match(re);
                if (mathes && mathes.length) {
                    rootpath = mathes[1].replace(/\//g, '\\');
                    if (rootpath.substr(0,1) == ".") rootpath = ���������;
                    result = rootpath;
                    ���������������������������[result] = {};
                    break
                }
            }
            TextDoc.Clear();
            TextDoc.Write(PathToOutput, "UTF-8");
        }
    }
    return result
} //bzr_getRootCatalog

function bzr_test(pathToCatalog) {
    
    var f = v8New("File", pathToCatalog);
    if (!f.Exist()) return false; 
    if (!f.IsDirectory()) return false;
    var f = v8New("File", FSO.BuildPath(pathToCatalog, '.bzr'));
    if (!f.Exist()) {
        return false
    }
    return true
} //bzr_test

function bzr_getStatusForCatalog(pathToCatalog, ValueTablesFiles) {

    ���������������������������[pathToCatalog] = {};
    
    var �������������������� = ���������������������������[pathToCatalog];
    var TextDoc = v8New("TextDocument");
    TextDoc.Write(PathToOutput, "UTF-8")
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "' +pathToCatalog+'"');
    TextDoc.AddLine('bzr status -S >> "'+PathToOutput+'"');
    TextDoc.Write(PathToBat, "cp866");
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
            //TextDoc.Read(PathToOutput, "UTF-8");
            TextDoc.Read(PathToOutput, "cp866 ");
            if (TextDoc.LineCount() == 0) {
                return false //��� �� ����� �� ���. 
            }
            var i=0;
            re = new RegExp(/.*(M|N|D|\?)\s*(.*)/);
            
            for (var i=1; i<=TextDoc.LineCount(); i++)
            {
                var r = TextDoc.GetLine(i);
                var mathes = r.match(re);
                if (mathes && mathes.length) {
                    filename = ""+mathes[2]
                    filename = filename.replace(/\//g, '\\'); 
                    switch (mathes[1]) 
                    {
                        case "M":
                        ��������������������[FSO.BuildPath(pathToCatalog, filename)]= "EDITED"
                        break;
                        
                        case "N":
                        ��������������������[FSO.BuildPath(pathToCatalog, filename)]= "ADDED"
                        break;
                        
                        case "?":
                        ��������������������[FSO.BuildPath(pathToCatalog, filename)]= "NOTVERSIONED"
                        break;
                        
                        case "D":
                        ��������������������[FSO.BuildPath(pathToCatalog, filename)]= "DELETED"
                        break;
                    }
                    continue;
                }
            }
    
        return true
} //bzr_getStatusForCatalog

function bzr_getFileStatus(pathToCatalog, pathToFile){
    var �������� = pathToCatalog
    var rootCatalog = bzr_getRootCatalog(pathToFile)
    
    ����������������� = ���������������������������[rootCatalog];
    if (����������������� == undefined) return null 
    
    return (�����������������[pathToFile] == undefined) ? null : �����������������[pathToFile]
    
} //bzr_getFileStatus

function bzr_add(pathToFile, param2) {
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    var f = v8New("File", pathToFile);
    if (f.IsDirectory()) {
        pathToFile = '.'
    } else {
        pathToFile = '"'+pathToFile+'"'
    }
    
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "'+rootCatalog+'"')
    TextDoc.AddLine('bzr add ' +pathToFile);
    TextDoc.Write(PathToBat, 'cp866');
    
    TextDoc.Clear();
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    return ErrCode
} //bzr_add

function bzr_run(pathToFile){
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    var TextDoc = v8New("TextDocument");
    �������������������('bzr explorer "'+rootCatalog+'"', "", false);
    TextDoc = null;
} //bzr_run

function bzr_getFileAtRevision(pathToFile, rev){
    
    var TextDoc = v8New("TextDocument");
    TextDoc.��������(PathToOutput, "UTF-8");
    
    var f = v8New("File", pathToFile);
    if (!f.Exist()) 
    {
        Message(" ����� ��������� �� ����������...") 
        return null;
    }
    var rootCatalog = bzr_getRootCatalog(pathToFile)
    if (rev.length !=0) {
        var filerev = FSO.BuildPath(TempDir, rev+f.���);
        TextDoc.AddLine('cd /d "' +rootCatalog +'"')
        TextDoc.AddLine('bzr cat -r '+rev +' "'+pathToFile +'" > ' + filerev)
        TextDoc.Write(PathToBat, 'cp866');
        TextDoc.Clear();
        ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
        return filerev;
    }
    return null
} //bzr_getFileAtRevision


function bzr_commit(pathToFile, message) {
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    var f = v8New("File", pathToFile);
    if (f.IsDirectory()) {
        pathToFile = ''
    } else {
        pathToFile = '"'+pathToFile+'"'
    }
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "'+rootCatalog+'"')
    TextDoc.AddLine('bzr commit ' +pathToFile+' -m "'+message+'"');
    TextDoc.Write(PathToBat, 'cp866');
    
    TextDoc.Clear();
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    return ErrCode
} //bzr_commit

function bzr_getFilePathToDiff(param1, param2) { //������� ������ ����� � ����������...
    
    var TextDoc = v8New("TextDocument");
    TextDoc.��������(PathToOutput, "UTF-8");
    // ���������� ����� ��������, path1 � path2 
    var pathToFile = param1;
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    param2.insert("path1", pathToFile);
    param2.insert("path2", "");
    
    var f = v8New("File", pathToFile);
    if (!f.Exist()) return false
    var path2 = GetTempFileName(f.Extension.substr(1));
    // ������� shell � ������ ������ ������. 
    TextDoc.Clear();
    TextDoc.AddLine('cd /d "' +rootCatalog +'"')
    TextDoc.AddLine('bzr cat "'+pathToFile+'" > "' +path2+'"');
    TextDoc.Write(PathToBat, 'cp866');
    
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    var f = v8New("File", path2);
    if (!f.Exist()) { // ���� ����� ��� �����, �� ������. ����� �������. 
        Message("��������� ������� ������� ���� � ��������� �������!");
    }
    
    param2.insert("path2", path2);
    
    return true
} //bzr_getFilePathToDiff

function bzr_remove(pathToFile) {
    var rootCatalog = fossil_getRootCatalog(pathToFile);
    var f = v8New("File", pathToFile);
    if (f.IsDirectory()) {
        return false
    }
    
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "'+rootCatalog+'"')
    TextDoc.AddLine('bzr remove "' +pathToFile+'"');
    TextDoc.Write(PathToBat, 'cp866');
    TextDoc.Clear();
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    return ErrCode
} //bzr_remove

function bzr_revert(pathToFile, ver) {
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    var TextDoc = v8New("TextDocument");
    TextDoc.��������(PathToBat, "UTF-8");
	TextDoc.AddLine('cd /d"' +rootCatalog +'"')
	var cmd = (ver.length>0) ? 'bzr revert -r '+ver+' "' +pathToFile+'"' : 'bzr revert  "' +pathToFile+'"';
	TextDoc.AddLine(cmd);
    TextDoc.Write(PathToBat, 'cp866');
    TextDoc.Clear();
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    return ErrCode
} //bzr_revert


function bzr_getLog(pathToFile, limit) { //���� �������, ����� ���������� ��� ��������, ���� ����, ����� ��� ��� �����. 
    //���������� ������ �� ����������:
    // arrary[0]['version':122333, 'comment':"�� �� ��������", 'author':"sosna", 'date':"2012-04-01"]
    var result = []
    f = v8New("File", pathToFile);
    if (!f.Exist()) return result
    //��������, ���� �� �� ��� ���������� ��������� � ���.
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "'+rootCatalog+'"');
    if (!f.IsDirectory()) {
        TextDoc.AddLine('bzr log -S --line -l '+limit+' '+pathToFile +' > "'+PathToOutput+'"');
    } else {
        TextDoc.AddLine('bzr log -S --line -l '+limit+' > "'+PathToOutput+'"');
    }
    TextDoc.Write(PathToBat, 'cp866');
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    TextDoc.Clear();
    TextDoc.Read(PathToOutput, "cp866");
    if (TextDoc.LineCount() == 0) {
            return result 
    }
    
    var index=0;
    for (var i=1; i<=TextDoc.LineCount(); i++)
    {
        var r = TextDoc.GetLine(i);
        var re = new RegExp(/(\d*):\s(.*)\s([0-9]{4}-[0-9]{2}-[0-9]{2})\s(.*)/);
        var mathes = r.match(re);
        if (mathes && mathes.length) {
            // ��� ������ ������, ������ ������ id ������ � �.�.
            result[index] = {"version":mathes[1], "comment":''+mathes[4], "date":mathes[3], "author":mathes[2]}
            index++;
        }
    }
    
return result;    
} // fossil_getLog

function bzr_getInfo(pathToFile, ver) {
    var result = {"comment":"", "files":[]}
    var rootCatalog = bzr_getRootCatalog(pathToFile);
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "'+rootCatalog+'"')
    TextDoc.AddLine('bzr log -S --show-ids -v -r'+ver +'  > "'+PathToOutput+'"')
    TextDoc.Write(PathToBat, 'cp866');
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
    TextDoc.Clear();
    TextDoc.Read(PathToOutput, "cp866");
    if (TextDoc.LineCount() == 0) {
        return result 
    }
    var index=0;
    for (var i=1; i<=TextDoc.LineCount(); i++)
    {
        var r = TextDoc.GetLine(i);
        re_files = new RegExp(/\s*(A|D|M)\s+(.+)\s(\S*-[0-9]{14}-\S+)/);
        var mathes = r.match(re_files);
        if (mathes && mathes.length) {
            result['files'][index] = {"version":ver, "file":''+mathes[2], "status":mathes[1], "fullpath":FSO.BuildPath(rootCatalog, mathes[2].replace(/\//g, '\\'))}
            index++;
        }
    }
    result["comment"] = TextDoc.GetText();
    return result
}




function Backend_bzr(command, param1, param2) {
    var result = false;
    //Message(" Backend_bzr " + command)
    switch (command) 
    {
    case "CATALOGSTATUS":
        // ��������� � ����� �������.
        result = bzr_getStatusForCatalog(param1, "");
        break;
    case "FILESTATUS":
        result = bzr_getFileStatus(param1, param2)
        break;
    case "GETFILESMISSUNG":
        //result = {} //��������. 
        break;
    case "DIFF":
        //result = bzr_getFilePathToDiff(param1, param2)
        Message("��������, ��� �� ����������� ������� DIFF");
        break;
    case "ADD":
        result = bzr_add(param1, param2)
        break;
    case "TEST":
        result = bzr_test(param1)
        break;
    case "RUN":
        result = bzr_run(param1, param2)
        break;
    case "SHOWLOG": // ������, ���� ���������. 
        //result = fossil_showlog(param1);
        break
    case "SHOWDIFF":
        result = bzr_getFilePathToDiff(param1, param2);
        break
    case "DELETE":
        result = bzr_remove(param1)
        break
    case "REVERT":
        result = bzr_revert(param1, param2);
        break
    case "COMMIT":
        result = bzr_commit(param1, param2);
        break
    case "GETFILEATREVISION":
        result = bzr_getFileAtRevision(param1, param2)
        break
    case "GETLOG":
        result = bzr_getLog(param1, param2);
        break
    case "GETINFO":
        result = bzr_getInfo(param1, param2);
        break
    }
    return result
} //Backend_bzr

function GetBackend() {
    return Backend_bzr
} //GetBackend
