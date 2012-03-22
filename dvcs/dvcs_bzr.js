$engine JScript
$uname dvcs_bzr
$dname Backend � dvcs bzr
$addin global

// (c) ����� ������� shenja at sosna.zp.ua
// ������ - Backend � fossil ��� ����������� ����������� ��������. 

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
            //var pathToCatalog = f.Path;
            ��������� = f.Path;
            TextDoc.AddLine('cd /d"' +��������� +'"')
            TextDoc.AddLine('bzr info >> "'+PathToOutput+'"');
            TextDoc.Write(PathToBat, 'cp866');
            ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
            TextDoc.Read(PathToOutput, "UTF-8");
            if (TextDoc.LineCount() == 0) {
                //Message ("�������� ����������, �� ����� �� ���������, ���� ��������!")
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
				
                /* if (r.indexOf(" root:")!=-1){ // ��� �����, ������ 
					
                    ���������  = r.split('   ')[1];
                    �������� = ���������.replace(/\//g, '\\');
                    �������� = ��������.substr(0, ��������.length-1);
                    break;
                } */
            }
            TextDoc.Clear();
            TextDoc.Write(PathToOutput, "UTF-8");
            //result = ��������
        }
    }
	//Message("getRootCatalog "+result)
    return result
} //bzr_getRootCatalog

function bzr_test(pathToCatalog) {
    
	var f = v8New("File", pathToCatalog);
	if (!f.Exist()) return false; 
    if (!f.IsDirectory()) return false;
	var f = v8New("File", FSO.BuildPath(pathToCatalog, '.bzr'));
	if (!f.Exist()) {
		//Message("bzr_test is false" + f.FullName)
		return false
	}
    //if (!FSO.FileExists(FSO.BuildPath(pathToCatalog, '.bzr'))) return false; //���� ����, ����� �������. �������� �������� � ���, ��� _FOSSIL_ ��������� � ���� ���� � �������������� �����������.
    
	//Message("bzr_test is true")
    return true
} //bzr_test

function bzr_getStatusForCatalog(pathToCatalog, ValueTablesFiles) {

    ���������������������������[pathToCatalog] = {};
    
    var �������������������� = ���������������������������[pathToCatalog];
    /* var PathToFossilOutput = TempDir + "fossilstatus.txt" // ����� 1� ���� � utf-8, ������� ���� ������ fossil ����� ����� ������ ���. 
    var PathToBatFossil = TempDir + "fossilTrue.bat" */
    var TextDoc = v8New("TextDocument");
    //TextDoc.AddLine("��������� ���� ��� bzr");
    TextDoc.Write(PathToOutput, "UTF-8")
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine('cd /d "' +pathToCatalog+'"');
    TextDoc.AddLine('bzr status -S >> "'+PathToOutput+'"');
    /* TextDoc.AddLine('echo NOTVERSIONED >> "'+PathToFossilOutput+'"');
    TextDoc.AddLine(PathToFossil+' extras >> "'+PathToFossilOutput+'"');
    TextDoc.AddLine('echo ENDNOTVERSIONED >> "'+PathToFossilOutput+'"'); */
    TextDoc.Write(PathToBat, "cp866");
    ErrCode = WshShell.Run('"'+PathToBat+'"', 0, 1)
            //TextDoc.Read(PathToOutput, "UTF-8");
			TextDoc.Read(PathToOutput, "cp866 ");
            if (TextDoc.LineCount() == 0) {
                //Message ("�������� ����������, �� ����� �� ���������, ���� ��������!")
                return false //��� �� ����� �� ���. 
            }
            var i=0;
			re = new RegExp(/.*(M|N|D|\?)\s*(.*)/);
			
            for (var i=1; i<=TextDoc.LineCount(); i++)
            {
                var r = TextDoc.GetLine(i);
				var mathes = r.match(re);
				if (mathes && mathes.length) {
					//Message(" "+mathes + " "+mathes.length)
					filename = ""+mathes[2]
					//Message(" "+mathes + " "+mathes.length+ " "+filename + " "+i)
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
	/* var abspath = FSO.GetAbsolutePathName(PathToFossil);
	var f = v8New('File', abspath);
	if (f.Exist()) {
		TextDoc.AddLine('PATH = %PATH%;'+f.Path+'"');
	} */
	
	//TextDoc.AddLine('bzr explorer "'+rootCatalog+'"')
    //TextDoc.AddLine('cd /d "'+rootCatalog+'"')
    //TextDoc.AddLine('start cmd.exe')
    //TextDoc.Write(PathToBat, 'cp866');
	�������������������('bzr explorer "'+rootCatalog+'"', "", false);
	TextDoc = null;
} //bzr_run

function fossil_getFileAtRevision(pathToFile, rev){
    
    var TextDoc = v8New("TextDocument");
    TextDoc.��������(PathToFossilOutput, "UTF-8");
    
    var f = v8New("File", pathToFile);
    if (!f.Exist()) 
    {
        Message(" ����� ��������� �� ����������...") 
        return nell
    }
    var rootCatalog = bzr_getRootCatalog(pathToFile)
    if (rev.length !=0) {
    
        var filerev = FSO.BuildPath(TempDir, rev+f.���);
        
        
        TextDoc.AddLine('cd /d "' +rootCatalog +'"')
        TextDoc.AddLine('bzr cat -r '+rev +' "'+pathToFile +'" > ' + filerev)
        //TextDoc.AddLine('copy /Y "'+pathToFile +'" "'+filerev+'"')
        //TextDoc.AddLine(PathToFossil+' undo "'+pathToFile +'" ')
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
        //result = fossil_getFilePathToDiff(param1, param2)
        break;
    case "ADD":
        result = bzr_add(param1, param2)
        break;
    case "TEST":
		//Message(" Backend_bzr " + command)
        result = bzr_test(param1)
        break;
    case "RUN":
        result = bzr_run(param1, param2)
        break;
    case "SHOWLOG":
        //result = fossil_showlog(param1);
        break
    case "SHOWDIFF":
        //result = fossil_getFilePathToDiff(param1, param2);
        break
    case "DELETE":
        //result = fossil_delete(param1)
        break
    case "REVERT":
        //result = fossil_revert(param1, param2);
        break
    case "COMMIT":
        result = bzr_commit(param1, param2);
        break
    case "GETFILEATREVISION":
        result = bzr_getFileAtRevision(param1, param2)
        break
    case "GETLOG":
		//result = fossil_getLog(param1);
        break
	case "GETINFO":
		//result = fossil_getInfo(param1, param2);
		break
    }
    return result
} //Backend_fossil

function GetBackend() {
	//Message("Get Backend_bzr ")
    return Backend_bzr
} //GetBackend
