$engine JScript
$uname configCaption 
$dname ��������� ���� �������������

addins.byUniqueName("global").object.connectGlobals(SelfScript)

��������������������������������������������()

function macros������������������������()
{
    Message("��� ������� ���� = <" + ������������������������() + ">")
}

// ��� ����������� ������� ��������� ����� �������� - �� ��� ����� ����� �����, ��� ����� ��������
function ��������������������������������������������()
{
    ��������������������������(������������������������������()  + " / ����: " + ������������������������() + " / �������� " + sVersion)
}

function ��������������������������������������������()
{
    ��������������������������(������������������������������() + " / ����: " + ������������������������())
}

function ������������������������()
{
    return profileRoot.getValue("CmdLine/IBName").replace(/^\s*|\s*$/g, '');
}

function ������������������������������()
{
    �������������������� = ������������������������().replace(/\s*\/\s*����\s*.+/ig, '')
    return ��������������������;
}

function macros����������������������������������()
{
    ���������������� = ����������������������������������();
    var baseName = ������������������������1C��������������(����������������)
    Message("��� ������� ���� = <" + baseName + ">")
}

function ��������������������������������_������()
{
    ��������������� = ������������������������������()
    ���������������� = ����������������������������������();
    
    ���������������� = ������������������������1C��������������(����������������)
    ��������������������������(���������������  + " / " + ���������������� + " / �������� " + sVersion)
}

function ������������������������1C��������������(����������������)
{
    // ������ ����� �� ������� CmdLine\IBName
    if(!����������������)
        return null

    var fso = new ActiveXObject("Scripting.FileSystemObject");

        //appDataPath = wsh.ExpandEnvironmentStrings("%AppData%")
        //Path1C = appDataPath + "\\1C\\1CEStart\\ibases.v8i"
    var appDataPath = profileRoot.getValue("Dir/AppData")
    Path1C = appDataPath + "..\\1CEStart\\ibases.v8i"

    if(!fso.FileExists(Path1C)){
    	Message("���� <"+Path1C + "> �� ����������.")
    	return
    }
    var File = fso.GetFile(Path1C)

	var textDoc = v8New("�����������������")
	textDoc.���������(Path1C)

        // ������� orefkov-� �� ������ ������� �� VBScript - ���� �������� �������� � ���.����������� :(
	    //var vbs = addins.byUniqueName("vbs").object
        //  vbs.var1 = line
        //  vbs.var2 = ����������������
        //	vbs.result = ""
        //	var pos = vbs.DoEval("InStr(var1,var2)") //����� ������� �� ���������� ��� �������, �� ���������� ��� RegExp
	
	// � ����� ������ � ������� ����� ����� �������
	var vbs = addins.byUniqueName("vbs2").object
    var InStr = vbs.vb.Function('InStr'); //var InStr = vbs.Function('InStr'); // ��� vbs.vb �� ��������

    re_baseName = /^\s*\[\s*(.+)\s*\]\s*$/ig // ��� ���� ��� ����� ��������� � �������� ��������
    re_connectString = /Connect=.*/ig // ������ ����������
    
	var lineCount = textDoc.���������������()
	var currName = ""
	for(var lineNum = 1; lineNum <= lineCount; lineNum++)
	{
		var line = textDoc.��������������(lineNum); //.replace(/^\s*|\s*$/g, '')	// ��� ����� ������ �� JScript'�����
//		if(0 == line.length || '//' == line.substr(0, 2))	// ���������� ������ ������ � �����������
//			continue
        var re_res = line.match(re_baseName)
        if(re_res){
            currName = RegExp.$1.replace(/^\s*|\s*$/g, '')	// ��� ����� ������ �� JScript'�����
            continue
        }
        var re_res = line.match(re_connectString)
        if(!re_res) continue
		
		���������������� = ����������������������������������();
        var pos = line.indexOf(����������������) //InStr(line, ����������������)
	    if(-1 != pos)
            break
    }
    return 0 == currName.length ? null : currName;
}

function macros��������������������������()
{
    ��������� = ����(����������������������������������(), "File")
    if(���������)
        ���������������� = ���������
    else
        ���������������� = ����(����������������������������������(), "Srvr") + ":" + ����(����������������������������������(), "Ref")
    Message(����������������)
}