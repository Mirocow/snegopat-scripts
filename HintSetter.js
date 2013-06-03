$engine JScript
$uname HintSetter
$dname ��������� ���������
$addin global
$addin stdcommands
$addin stdlib

////////////////////////////////////////////////////////////////////////////////////////
////{ C����� "��������� ���������" (HintSetter.js) ��� ������� "��������"
////
//// ��������: ������������� ��������� � �������� ���������� ��������� �������:
////           ���� ��������� �� ���������, �� ��� ��������������� �� ������� �� ����� ������� ����������, ���� � ������� ��� ����� ������, �� ��������������� �������.
////           �������� �������� � ������� ������ � ������ ���������� � ���� �� ������ (��� ���� ����������� ��������).
////           �������� �� �������� ��������� ������ ���������� (� ������ ������� �� �����������).
////
////           ������ �������:
////           <��� ������� ����������>: <����� ���������>
////
//// TODO list:
////            - ����� ��������� ������� (������������ � ��� �������, ������������� �� ��������, ��� ������ �� �������, ��������� �����)
////            - �������������� � ��������������� ��������� (���� ���������� �� ������� (�������� ������ �� ������������� ��� �� ��������))
////            - ��������� ��������� ����� �������� ����������
////            - ��������� ���� ������������
////            - ����� ������ ��������� ����������� (� ������� ���������� ��������� �������� ������ ��� �������� �����, � ��� ��������� ������� ��� ��������� ����� ����� ��������)
////
//// �����: ������� ������� <dmitro-75@mail.ru>
////}
////////////////////////////////////////////////////////////////////////////////////////

global.connectGlobals(SelfScript);

function getPredefinedHotkeys(predef){
    predef.setVersion(1);
    predef.add("���������� ���������", "Ctrl + Alt + H");
}

function getHint(mdObj)
{
    var hint = mdObj.property("���������");
    var re = /"ru","([\s\S]+)"/;
    var ar = re.exec(ValueToStringInternal(hint));
    if (ar == null)
        return "";
    return ar[1];
}

function setHint(mdObj, hint)
{
    var text = "{\"#\",87024738-fc2a-4436-ada1-df79d395c424,{1,\"ru\",\""+hint+"\"}}";
    var res = mdObj.setProperty("���������", ValueFromStringInternal(text));
    if (!res)
        Message("������ : �� ������� ���������� ��������� � ������� " + mdObj.name)
}

function UpdateHint(mdObj)
{
    var hint = getHint(mdObj);
    if (hint == "")
    {
        var hint = CommonHints.Get(mdObj.name);
        if (hint == undefined)
            hint = mdObj.synonym("ru");
        setHint(mdObj, hint);
    }
}

function UpdateHintFor(mdObj, coll)
{
    var count = mdObj.childObjectsCount(coll);
    for (i = 0; i < count; i++)
        UpdateHint(mdObj.childObject(coll, i));
}

function UpdateHintForFor(mdObj, coll1, coll2)
{
    var count = mdObj.childObjectsCount(coll1);
    for (i = 0; i < count; i++)
        UpdateHintFor(mdObj.childObject(coll1, i), coll2);
}

function GetMDObjectAddress()
{
    view = windows.getActiveView();
    if (view.mdObj != metadata.current.rootObject)
        return null;
    var ar = new Array();
    GetMDName(view.getInternalForm().activeControl.extInterface.currentRow, ar);
    ar.reverse();
    return ar;
}

function GetMDName(row, ar)
{
    if (row.parent == null)
        return;
    var name = row.getCellAppearance(0).text;
    ar.push(name);
    GetMDName(row.parent, ar);
}

function UpdateChildren(ar, mdObj)
{
    if (ar[2] == "���������" || ar[2] == "�������" || ar[2] == "���������" || ar[2] == "�������")
    {
        if (ar.length > 3)
            UpdateHint(mdObj.childObject(ar[2], ar[3]));
        else
            UpdateHintFor(mdObj, ar[2]);
    }
    else if (ar[2] == "��������� �����")
    {
        if (ar.length > 3)
        {
            var mdObj = mdObj.childObject("��������������", ar[3]);
            if (ar.length > 4)
                UpdateHint(mdObj.childObject("���������", ar[4]));
            else
                UpdateHintFor(mdObj, "���������");
        }
        else
            UpdateHintForFor(mdObj, "��������������", "���������");
    }
    else
        MessageBox("��� ���� ������ �������� ��������� ��������� �� �������������.");
}

function UpdateCommonObject(ar, className)
{
    var mdObj = metadata.current.rootObject.childObject(className, ar[1]);
    if (ar.length > 2)
        UpdateChildren(ar, mdObj);
    else
    {
        UpdateHintFor(mdObj, "���������");
        UpdateHintForFor(mdObj, "��������������", "���������");
        UpdateHintFor(mdObj, "�������");
    }
}

function UpdateRegisterObject(ar, className)
{
    var mdObj = metadata.current.rootObject.childObject(className, ar[1]);
    if (ar.length > 2)
        UpdateChildren(ar, mdObj);
    else
    {
        UpdateHintFor(mdObj, "���������");
        UpdateHintFor(mdObj, "�������");
        UpdateHintFor(mdObj, "���������");
        UpdateHintFor(mdObj, "�������");
    }
}

function UpdateByAddress(ar, MDClassName)
{
    if (MDClassName == "����������������" || MDClassName == "������������������")
        UpdateRegisterObject(ar, MDClassName);
    else
        UpdateCommonObject(ar, MDClassName);
}

function GetMDClassName(ar)
{
    if (ar[0] == "�����������" || ar[0] == "���������" || ar[0] == "������")
        return ar[0];
    else if (ar[0] == "���������")
    {
        if (ar.length > 1)
        {
            if (ar[2] == "����������" || ar[1] == "������������������")
                return null;
        }
        return "���������";
    }
    else if (ar[0] == "����� ����� �������������")
        return "�����������������������";
    else if (ar[0] == "�������� ��������")
        return "����������������";
    else if (ar[0] == "�������� ����������")
        return "������������������";
    else
        return null;
}

var filePath = "c:\\000\\CommonHints.txt";
var CommonHints = null;
var CommonHintsDate = null;

function LoadCommonHints()
{
    
    var fileInfo = v8New("File", filePath);
    var isExist = fileInfo.Exist();
    if (CommonHints != null)
        if (isExist && fileInfo.GetModificationTime() != CommonHintsDate)
            return;
        
    //debugger;
    CommonHints = v8New("Map");
    CommonHintsDate = null;
    
    if (!isExist)
        return;
    
    var file = v8New("TextReader", filePath);
    CommonHintsDate = fileInfo.GetModificationTime();
    
    for (var str = file.ReadLine(); str != undefined; str = file.ReadLine())
    {
        var index = str.indexOf(":");
        var name, hint;
        if (index == -1)
            continue;
        
        var name = str.substr(0, index).replace(/^\s+/, '').replace(/\s+$/, '');
        var hint = str.substr(index + 1).replace(/^\s+/, '').replace(/\s+$/, '');
        CommonHints.Insert(name, hint);
    };
    file.Close();
}

SelfScript.self['macros���������� ���������'] = function() {

    try
    {
        LoadCommonHints();
        
        var ar = GetMDObjectAddress();
        if (ar.length == 0)
        {
            MessageBox("��� ���� ������������ ��������� ��������� �� �����������.");
            return true;
        }
        
        var MDClassName = GetMDClassName(ar);
        if (MDClassName == null)
        {
            MessageBox("��� ����� ������� ��������� ��������� �� �������������.");
            return true;
        }
        
        if (ar.length > 1)
            UpdateByAddress(ar, MDClassName);
        else
        {
            for (var row = view.getInternalForm().activeControl.extInterface.currentRow.firstChild; row != null; row = row.next)
            {
                var Name = row.getCellAppearance(0).text;
                if (MDClassName == "���������" && (Name == "����������" || Name == "������������������"))
                    continue;
                
                ar[1] = Name;
                UpdateByAddress(ar, MDClassName);
            }
        }
    }
    catch(e)
    {
        Message("������ : " + e.description)
    }

    return true;
}
