$engine JScript
$uname diff_v8Reader
$dname Backend � diff ��������� (ssf, cf)
$addin global

global.connectGlobals(SelfScript)

var mainFolder = profileRoot.getValue("Snegopat/MainFolder")

var pathTo1C = mainFolder + "\\core\\starter.exe";
//var pathToBase = mainFolder + "\\scripts\\dvcs\\basediff";

var ���������������=null

function macros��������v8Reader(){
    var pathToForm=SelfScript.fullPath.replace(/js$/, 'ssf')
    ���������������=loadScriptForm(pathToForm, SelfScript.self) // ��������� ������� ����� �������� � ������ �������
    ���������������.���������������()
}

function ������������������()
{
    pathToBase = ���������������.pathToBase;
    profileRoot.setValue(pflPathToBase, pathToBase)
}

function �����������()
{
    ���������������.pathToBase=pathToBase
}

function pathToBase������������(�������, ��������������������) {
    �����=���������������()
    if(�����=="") return
    �������.val.��������=�����
}

function �����������������(������) {
    ������������������();
    ���������������.�������();
}

function ���������������()
{
    �������������������=v8New("�����������������", �����������������������.ChooseDirectory)
    �������������������.��������� = "�������� ������� ������������ ���� ��������� "
    if(�������������������.�������()==false) return ""
    return �������������������.�������
}

function ����������������������������� (������) {
    var �pathToBase = ���������������.pathToBase;
    if (�pathToBase.length <1) {
        var �pathToBase = mainFolder + "basediff";
        try {
            ��������������(�pathToBase);
            Message("������ ������� " + �pathToBase);
        } catch (e) {
            Message("������ ��� �������� �������� " + �pathToBase + " �������� ������ " + e.description) ;
            return;
        }
    }
    try {
        var cmd = '"'+pathTo1C+'" CREATEINFOBASE File="'+�pathToBase+'"; /AddInList diff1Cv8Reader /UseTemplate "'+mainFolder + "scripts\\dvcs\\basediff\\v8reader.dt" +'"';
        �������������������(cmd, "", true);
		���������������.pathToBase = �pathToBase;
    } catch (e) {
        Message("������ ��� �������� ����. ��������� dt ������� � ������� ���� � ����. " + mainFolder + "scripts\\dvcs\\basediff\\v8reader.dt " +e.description);
        return;
    }
}

function diff_v8Reader(Path1, Path2) {

    if (pathToBase.length<1) {
        Message("���������� ��������� ���� � ��������� ���� ��� ���������.")
        Message("�������� ��������� ��� ������� Backend � diff ��������� (ssf, cf) � ��������� ��.")
        return
    }
    sBaseDoc = Path1.replace(/\//g, '\\');
    sNewDoc = Path2.replace(/\//g, '\\');
    var tmpfile = ��������������������������("txt");
    var TextDoc = v8New("TextDocument");
    TextDoc.AddLine(sBaseDoc)
    TextDoc.AddLine(sNewDoc)
    TextDoc.Write(tmpfile);
    var FSO = new ActiveXObject("Scripting.FileSystemObject");
    var cmd = '"'+pathTo1C+'" enterprise /RunModeOrdinaryApplication  /F"'+pathToBase+'" /C"'+FSO.GetAbsolutePathName(tmpfile)+'" ' ;
    �������������������(cmd);
} //diff_v8Reader

function GetExtension() {
    return "ssf|cf";
} //GetExtension

function GetBackend() {
    return diff_v8Reader
} //GetBackend


function getDefaultMacros() {
    return '��������v8Reader'
} //getDefaultMacros

////////////////////////////////////////////////////////////////////////////////////////
////{ ������������� �������
////

var pflPathToBase         = "diffv8Reader/pathToBase"
profileRoot.createValue(pflPathToBase, "", pflSnegopat);

var pathToBase = profileRoot.getValue(pflPathToBase)
////} ������������� �������