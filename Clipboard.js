$engine JScript
$uname Clipboard
$dname ����� ������
$addin global
//$addin stdlib

global.connectGlobals(SelfScript)

/* ������ ��� ������� ������ ����� ����� ������, ��������� �������� ������ ��� ��������� � ������������ �������� ������, ���� ��� ����� ���� � ������ ������
 * �����		: ����� ������� aka artbear aartbear@gmail.com
 * �������� �������: http://snegopat.ru/scripts/wiki?name=Clipboard.js
 * ���� ��������: 19.10.2011
 * ��������		: ������ ����� ������� ��� ��������� � 1� 7.7 - ������ � ������ ������� ���������
    ������ "����� ������"
    1. � ����� ������� � ������� � ������� FAR-� ��������� �������:
        ������ ������ ���� � ����, ������� ������ ���� � ����� � ����� ������, ����� ������������ � ������������, 
        �������� �������� "������� ����", �������� ���� ����� �� ������ ������, � ������� ������� ��� �������� ������� ����� � �������������.
        ������, ��� �� ����� ����� ������� �� � ����.
    � ��� � ���� �������� ����� ������� ���������������� ���� �������:
        ����������� �������� ������ ���� ����� � ����� ������(��� ��� ������), ������������� � ������������, �������� "������� �����",
        � ������ �������� ������: ������������� �������� �����, ��������� ����� ������, ���� � ������ ��� ������������� �����, ��������� ���������� ����� �����,
        ���� ��� ���� � ����������� ����������� ��� 1�, �� ������ ���������� ��������� ���� ���� � �������������.
    2. ����������� ������� ��������������� � ���������������� �������� "��������, ���������� � ������������� �� �����" ��� ������ ������������

    �����: � ���������� ������� ����� ����� �������:
        - ���������������� ��������� ����������� ���������� ����������� ������ - �� ��������� erf, epf, txt, mxl, html, st, pff
        - ����������� �������� ����� ��� ������� ������� �� ���� � ���-� ��� ���������� � �.�.

    ������� �� ���� http://www.forum.script-coding.com/viewtopic.php?id=442

* ����������: ���������� ���������� dynwrapx.dll, �� ����� ����������������
    ������� �� ����� http://forum.script-coding.com/viewtopic.php?id=5341 (��. ��������� ����)

------------------------------------------------------------------------------- */

var _������������� = 0.3

//������� ������ ������
var CF_TEXT   =1
var CF_UNICODETEXT = 13;

Init();
    //Test();


function Test()
{
    //WScript.Echo("   CopyToClipboard")
testString1 = "���� ����� 4"
CopyToClipboard(testString1)

    //WScript.Echo("   GetFromClipboard")
newTestString = GetFromClipboard()
WScript.Echo(newTestString)

testString1 = "\"C:\\Cmd\\dynwrapx.dll\""
CopyToClipboard(testString1)
newTestString = GetFileNameFromClipboard()
WScript.Echo(newTestString)
}

// �������� �������. ����� ���������� ������� ����� ����������� �������, ����� ����� ���������� (���� �� ��������)
function hookFileOpenCommand(cmd)
{
    if(cmd.isBefore)
    {
        enableOpen = false;
        selectedFileName = GetFileNameFromClipboard()
        if (selectedFileName.length){
            var file = v8New("����", selectedFileName)
            enabledFileExt = ����������������.�����(file.����������) != undefined;
            if(!enabledFileExt) return;
            
            enableOpen = true;

            events.connect(Designer, "onSelectFile", SelfScript.self)
            haveHookOnSelectFile = true;
        }
    }
    else if(haveHookOnSelectFile)
    {
        events.disconnect(Designer, "onSelectFile", SelfScript.self)
        haveHookOnSelectFile = false
    }
}
var ����������������; // TODO ���� ���������������� ����� v8New("������"), �� ����� ��� ������������� ����� ������ :(

var enableOpen = false;
var selectedFileName = "";
var haveHookOnSelectFile = false;

function assert(p1, p2)
{
    if (p1 != p2) 
        throw "�������� <"+p1+"> �� ����� <"+p2+">, � ������� ���������";
}
function assertNot(p1, p2)
{
    if (p1 == p2) 
        throw "�������� <"+p1+"> ����� <"+p2+">, � ������� �����������";
}

// �������� �������. ����� ���������� ������� ����� ����������� �������, ����� ����� ���������� (���� �� ��������)
function hookCompareAndLoadConfigFromFileCommand(cmd)
{
    if(cmd.isBefore)
    {
        enableOpen = false;
        selectedFileName = GetFileNameFromClipboard()
        if (!selectedFileName.length) return
    
        var file = v8New("����", selectedFileName)
        if (file.���������� == ".cf"){
            ����� = "������������ ���� <"+selectedFileName+"> ?";
            ����� = ������(�����, ������������������.�����, 0);
            if( ����� != ������������������.���) {
                enableOpen = true; 
        
                events.connect(Designer, "onSelectFile", SelfScript.self)
                haveHookOnSelectFile = true;
            }
        }
    }
    else if(haveHookOnSelectFile)
    {
        events.disconnect(Designer, "onSelectFile", SelfScript.self)
        haveHookOnSelectFile = false
    }
}

// ����������, ���������� ����� 1� ���������� ������ ��� ������� ����� �����.
function onSelectFile(selectFileData) //As ISelectFileData
{
    if(selectFileData.mode != sfOpen) return;
    
    if(!enableOpen || !selectedFileName.length) return;

    selectFileData.addSelectedFile(selectedFileName)
    selectFileData.result = sfrSelected
}

// ���� � ������ ������ ���� � ������������� �����, ������������ ���� ����
// ���� ���� �������� ���������, �� ������� �������������
function GetFileNameFromClipboard()
{
    var strText = GetFromClipboard()
    var strText = strText.replace(/(^\s*)|(\s*$)/g, ""); //trim
    if(!strText.length) return ""
    
    if( strText.substr(0,1) == "\"") //InStr(strText, Chr(34)) == 1)
        strText = strText.substr(1)  //Mid(strText, 2)
    if(strText.substr(strText.length-1, 1) == "\"") //InStrRev(strText, Chr(34)) == strText.length)
        strText = strText.substr(0, strText.length-1) //Mid(strText, 1, strText.length - 1)
    
    var file = v8New("����", strText)
    if(file.����������()) 
            // fso = new ActiveXObject("Scripting.FileSystemObject")    
            // if (fso.FileExists(strText))
        return strText
    return ""
}

var dwx;

function Init()
{
    dwx = new ActiveXObject("DynamicWrapperX")
        if (!dwx) throw "���������� ������� ������ DynamicWrapperX";
    dwx.Register ("USER32.DLL", "OpenClipboard", "i=l", "f=s", "r=l");
    dwx.Register ("USER32.DLL", "GetClipboardData", "i=l", "f=s", "r=l");
    dwx.Register("USER32.DLL", "SetClipboardData", "i=uh", "f=s", "r=l")
    dwx.Register("USER32.DLL", "EmptyClipboard", "f=s", "r=l")
    dwx.Register ("USER32.DLL", "CloseClipboard", "f=s", "r=l");
    dwx.Register ("KERNEL32.DLL", "lstrcpy", "i=hs", "f=s", "r=l"); //"lstrcpy", "i=rl", "f=s", "r=l");
    dwx.Register("KERNEL32.DLL", "GlobalAlloc", "i=uu", "f=s", "r=l")
    dwx.Register ("KERNEL32.DLL", "GlobalLock", "i=l", "f=s", "r=l");
    dwx.Register ("KERNEL32.DLL", "GlobalSize", "i=l", "f=s", "r=l");
    dwx.Register ("KERNEL32.DLL", "GlobalUnlock", "i=l", "f=s", "r=l");
    
    // ���������� �� �������� ������� �������� �����
    events.addCommandHandler("{00000000-0000-0000-0000-000000000000}", 2, SelfScript.self, "hookFileOpenCommand")

    // ���������� �� �������� ������� "��������, ���������� � ������������� �� �����"
    events.addCommandHandler("{F10CBB81-F679-11D4-9DD3-0050BAE2BC79}", 6, SelfScript.self, "hookCompareAndLoadConfigFromFileCommand")
    
    // ��� cf - ����� ������������ !!
    ���������������� = v8New("������")
    ����������������.��������(".epf");
    ����������������.��������(".erf");
    ����������������.��������(".txt");
    ����������������.��������(".mxl");
    ����������������.��������(".html");
    ����������������.��������(".st");
    ����������������.��������(".pff");
}

function CopyToClipboard(testString)
{
    if (!testString) throw "�������� ������ ������"
    
        var GMEM_FIXED=0
    hGl = dwx.GlobalAlloc(GMEM_FIXED, testString.length+1)
        if (!hGl)  throw "���������� �������� ������"
    
    hGl = dwx.GlobalLock(hGl)
        if (!hGl)  throw "���������� ������������� ������"

    hGl = dwx.lstrcpy(hGl, testString) // TODO �������� �� ����� �� DWX
        if (!hGl)  throw "���������� ����������� ������ � ������"

        // res = dwx.GlobalUnlock(hGl)
        // if (!res)  throw "���������� �������������� ������"

    try{ 
        hRes = dwx.OpenClipboard(0)
    } catch(e)
    {
        try{
            hRes = dwx.OpenClipboard(0)
        } catch(e)
        {
            if (!hRes)  throw "���������� ������� ����� ������" 
        }
    }

    hRes = dwx.EmptyClipboard()
        if (!hRes)  throw "���������� �������� ����� ������"

    hRes = dwx.SetClipboardData(CF_TEXT, hGl)
        if (!hRes)  throw "���������� ��������� ������ � ����� ������"

    hRes = dwx.CloseClipboard()
        //if (!hRes)  throw "���������� ������� ����� ������"
}


function GetFromClipboard()
{
    hRes = dwx.OpenClipboard(0)
    if (!hRes)  throw "���������� ������� ����� ������"

    var hClipText = dwx.GetClipboardData(CF_TEXT); //��������� ������ ������.
    if (!hClipText)  return ""; //throw "���������� GetClipboardData" // TODO 

    ptrText = dwx.GlobalLock(hClipText); //����������� ������ � ���������.
        if (!ptrText)  throw "���������� ������������� ������";
    
    resStr = dwx.StrGet(ptrText, "s");

    hRes = dwx.GlobalUnlock(hClipText)
        //if (!hRes)  throw "���������� �������������� ������"

    hRes = dwx.CloseClipboard(); 
        //if (!hRes)  throw "���������� ������� ����� ������"
    return resStr;
}

function _GetFromClipboard_UNICODETEXT()
{
    hRes = dwx.OpenClipboard(0)
    if (!hRes)  throw "���������� ������� ����� ������"

        //var format = 0;
        //dwx.Register("USER32.DLL", "EnumClipboardFormats", "i=l", "f=s", "r=l")
        // do{
            // format = dwx.EnumClipboardFormats(0)
            // //if (!res)  throw "���������� EnumClipboardFormats"
        // } while(format != 0 && format != CF_TEXT && format != CF_UNICODETEXT)
        
        // if(!format){
            // res = dwx.CloseClipboard()
                //// if (!res)  throw "���������� ������� ����� ������"
            // return "";
        // }
    var resStr = "";

    if(true) //format == CF_TEXT)
    {
        var hClipText = dwx.GetClipboardData(CF_TEXT); //��������� ������ ������.
            if (!hClipText)  return ""; //throw "���������� GetClipboardData" // TODO 

        ptrText = dwx.GlobalLock(hClipText); //����������� ������ � ���������.
            if (!ptrText)  throw "���������� ������������� ������";
        
        resStr = dwx.StrGet(ptrText, "s"); // DllCall("msvcrt\memcpy", "Str", resStr, "UInt", PtrText, "UInt", TextLen+1, "Cdecl") ; ����� � ����������.

        hRes = dwx.GlobalUnlock(hClipText)
            //if (!hRes)  throw "���������� �������������� ������"
    }
        // else if(format == CF_UNICODETEXT)
        // {
            // var hClipText = dwx.GetClipboardData(CF_UNICODETEXT); //��������� ������ ������.
                // if (!hClipText)  throw "���������� GetClipboardData"
                
                // // PtrTextW :=DllCall("GlobalLock",       "UInt", HmemTextW)
                // // TextLen  :=DllCall("msvcrt\wcslen",    "UInt", PtrTextW, "Cdecl")
                // // VarSetCapacity(resStr, TextLen+1)
                // // DllCall("WideCharToMultiByte", "UInt", CodePage, "UInt", 0, "UInt", PtrTextW 
                                             // // , "Int", TextLen+1, "Str", resStr, "Int", TextLen+1
                                             // // , "UInt", 0, "Int", 0)  ; ����������� �� Unicode � ANSI.
            // hRes = dwx.GlobalUnlock(hClipText)
            // if (!hRes)  throw "���������� �������������� ������"
        // }

    hRes = dwx.CloseClipboard(); 
        //if (!hRes)  throw "���������� ������� ����� ������"
    return resStr;
}

function _GetFromClipboard1()
{
    hRes = dwx.OpenClipboard(0); 

    hClipMemory =  dwx.GetClipboardData(CF_TEXT);
    lSize = dwx.GlobalSize(hClipMemory);

    lpClipMemory = dwx.GlobalLock(hClipMemory);
    var MyString = dwx.Space(lSize, ""); //lSize);
    
    hRes = dwx.lstrcpy(MyString, hClipMemory);

    hRes = dwx.GlobalUnlock(hClipMemory);
    hRes = dwx.CloseClipboard();
    return MyString;
}
