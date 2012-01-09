$engine JScript
$uname Refactoring
$dname �����������
$addin global
$addin stdlib

////////////////////////////////////////////////////////////////////////////////////////
////{ C����� "�����������" (refactoring.js) ��� ������� "��������"
////
//// ��������: ��������� ���������� ����������� ������������.
//// �����: ��������� �������� <kuntashov@gmail.com>, http://compaud.ru/blog
////}
////////////////////////////////////////////////////////////////////////////////////////

stdlib.require('TextWindow.js', SelfScript);
stdlib.require('SyntaxAnalysis.js', SelfScript);

////////////////////////////////////////////////////////////////////////////////////////
////{ �������
////

SelfScript.self['macros�������� ������ (extract method)'] = function () {

    var tw = GetTextWindow();
    if (!tw) return;

    var selText = tw.GetSelectedText();
    if (selText == '') return;
        
    var tpl = '��������� <?"��� ���������">(<?"��������� ���������")\n\n\t<?>\n\n��������������//<?"��� ���������">()';
        
}

SelfScript.self['macros�������� ������ �������� � ������� ������'] = function () {
    var tw = GetTextWindow();
    if (!tw) return;
    var module = SyntaxAnalysis.AnalyseTextDocument(tw);
    var methList = new MethodListForm(module);
    methList.selectMethod();
}

////} �������

////////////////////////////////////////////////////////////////////////////////////////
////{ MethodListForm
////

function MethodListForm(module) {
    this.module = module;
    this.form = loadScriptForm(SelfScript.fullPath.replace(/\.js$/, '.methodList.ssf'), this);
    this.form.Controls.MethodList.Value = this.module.getMethodsTable();
}

MethodListForm.prototype.selectMethod = function () {
    return this.form.DoModal();
}

MethodListForm.prototype.MethodListSelection = function (Control, SelectedRow, Column, DefaultHandler) {
    //TODO: ��������� ������ ������.
    this.form.Close();
}

MethodListForm.prototype.MethodListOnRowOutput = function (Control, RowAppearance, RowData) {
    // �������� ���������� �����������.
}


////} MethodListForm


////////////////////////////////////////////////////////////////////////////////////////
////{ ��������������� �������
////



////} ��������������� �������
