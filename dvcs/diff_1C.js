$engine JScript
$uname diff_1C
$dname Backend � diff, ������� ��������� �� 1� (mxl,txt,js,vbs)
$addin global

global.connectGlobals(SelfScript)

function ���������������1�(Path1, Path2) {
    var file1 = v8New("File", Path1);
    var file2 = v8New("File", Path2);
    if ((!file1.isFile()) & (!file2.isFile())) return null 
    var ext1 = file1.Extension.substr(1).toLowerCase(); //������ ������ ������, �� � ������ �������, ����� windows
    var ext2 = file2.Extension.substr(1).toLowerCase(); //������ ������ ������, �� � ������ �������, ����� windows
    var fc = v8New("���������������")
    fc.���������� = Path1;
    fc.���������� = Path2;
    fc.��������������� = ���������������������.��������;
    if ((ext1.indexOf("mxl") >= 0) & (ext2.indexOf("mxl") >= 0)) fc.��������������� = ���������������������.�����������������;
    if ((ext1.indexOf("txt") >= 0) & (ext2.indexOf("txt") >= 0)) fc.��������������� = ���������������������.�����������������;
    if ((ext1.indexOf("js") >= 0) & (ext2.indexOf("js") >= 0)) fc.��������������� = ���������������������.�����������������;
    if ((ext1.indexOf("vbs") >= 0) & (ext2.indexOf("vbs") >= 0)) fc.��������������� = ���������������������.�����������������;
    
    fc.����������������();
} //���������������1�

function GetExtension () {
    return "mxl|txt|js|vbs";
} //GetExtension

function GetBackend() {
    return ���������������1�
} //GetBackend

