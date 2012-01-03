$engine JScript
$uname _RegExpEditor
$dname �������� ���������� ���������
$addin global
$addin stdlib

////////////////////////////////////////////////////////////////////////////////////////
////{ C����� "�������� ���������� ���������" (_RegExpEditor.js) ��� ������� "��������"
////
//// ��������: ������������� ����������� ��� �������������� � ������� ����������� ���������
//// � ��������� ���������� �����.
////
//// �����: ��������� �������� <kuntashov@gmail.com>, http://compaud.ru/blog
////}
////////////////////////////////////////////////////////////////////////////////////////

stdlib.require('TextWindow.js', SelfScript);

////////////////////////////////////////////////////////////////////////////////////////
////{ �������
////

SelfScript.Self['macros������������� ���������� ���������'] = function () {
    var reEditor = CreateRegExpEditor();
    reEditor.setTextWindow(GetTextWindow());    
    reEditor.open();
}

////} �������

////////////////////////////////////////////////////////////////////////////////////////
////{ RegExpEditor
////

function CreateRegExpEditor() {
    return new _RegExpEditor();
}

function _RegExpEditor() {
    this.form = loadScriptForm(SelfScript.fullPath.replace(/js$/, 'ssf'), this);

    this.textWindow = null; // ��������� ��������, �� �������� ������ ��������.
    this.re = null;
    
    this.resTree = this.form.ResultTree;
    
    this.rootRowRegExp = this.addRow(this.resTree, '', '', '���������� ���������');
    this.rowPattern = this.addRow(this.rootRowRegExp, 'RegExp', '');
    
    this.rootRowMatches = this.addRow(this.resTree, '', '', '����������');
    this.fillHelpers();
}

_RegExpEditor.prototype.open = function (pattern) {
    this.form.Open();
}

_RegExpEditor.prototype.addRow = function (parent, resultName, resultValue, groupHeader) {
    var row = parent.Rows.Add();    
    if (resultName) row.ResultName = resultName + ':';
    if (resultValue) row.ResultValue = resultValue;        
    if (groupHeader) row.GroupHeader = groupHeader;        
    return row;
}

_RegExpEditor.prototype.expandResultTree = function (expandAll) {
    for (var i=0; i<this.resTree.Rows.Count(); i++) 
        this.form.Controls.ResultTree.Expand(this.resTree.Rows.Get(i), expandAll ? true : false);
}

_RegExpEditor.prototype.expandMatches = function () {
    for (var i=0; i<this.rootRowMatches.Rows.Count(); i++)
        this.form.Controls.ResultTree.Expand(this.rootRowMatches.Rows.Get(i), true);
}

_RegExpEditor.prototype.collapseMatches = function () {
    for (var i=0; i<this.rootRowMatches.Rows.Count(); i++)
        this.form.Controls.ResultTree.Collapse(this.rootRowMatches.Rows.Get(i));
}

_RegExpEditor.prototype.getPattern = function () {
    var pattern = this.form.RegExSource;
    return pattern = pattern.replace(/\n/g, '');    
}

_RegExpEditor.prototype.getFlags = function () {
    var flags = this.form.IgnoreCase ? 'i' : '';
    flags += this.form.Global ? 'g' : '';
    flags += this.form.Multiline ? 'm' : '';
    return flags;
}

_RegExpEditor.prototype.updateRegExpObject = function () {
    
    var pattern = this.getPattern();
    
    if (!pattern)
    {
        this.clearResultTree();
        return;
    }
    
    var flags = this.getFlags();
    
    try 
    {
        this.re = new RegExp(pattern, flags);
    }
    catch (e)
    {   
        this.re = null;
        this.clearResultTree();
        this.rowPattern.ResultValue = e.description;
        return;
    }
    
    this.updateResultTree();    
}

_RegExpEditor.prototype.clearResultTree = function () {
    this.rowPattern.ResultName = 'RegExp';
    this.rowPattern.ResultValue = '';
    this.rootRowMatches.Rows.Clear();
}

_RegExpEditor.prototype.updateResultTree = function () {
    this.clearResultTree();
    if (!this.re) return;    
    
    this.rowPattern.ResultValue = this.re.toString();        
    var testString = this.form.TestString;
    var matches;
    
    while ((matches = this.re.exec(testString)) != null)
    {
        this.addMatches(matches);
        
        // ���� ����� �� ����������, �� ��������������� �� ������ �����.
        if (!this.form.Global)
            break;
    }
    
    if (this.rootRowMatches.Rows.Count() > 0)
    {
        if (this.form.Global)
            this.rootRowMatches.GroupHeader = '��������� ���������� (����� ' + this.rootRowMatches.Rows.Count() + ')';
        else
            this.rootRowMatches.GroupHeader = '��������� ����������';    
    }
    else 
    {
        this.rootRowMatches.GroupHeader = '���������� �� �������';
    }
    
    this.expandResultTree();
}

_RegExpEditor.prototype.addMatches = function (matches) {
    var matchNumber = this.rootRowMatches.Rows.Count() + 1;
    var matchRow = this.addRow(this.rootRowMatches, '���������� ' + (this.form.Global ? matchNumber : ''), matches[0]);
    var index = this.re.lastIndex - matches[0].length;
    this.addRow(matchRow, '������', index ? index : "0");
    this.addRow(matchRow, '�����', matches[0].length);
    this.addRow(matchRow, 'lastIndex', this.re.lastIndex);
    var groupsRow = this.addRow(matchRow, '�����������', matches.length - 1);
    for (var i=1; i < matches.length; i++)
        this.addRow(groupsRow, '������ ' + i, matches[i]);
}

_RegExpEditor.prototype.initRegExpFormProps = function (reSource, i, g, m) {
    this.form.RegExSource = reSource;
    this.form.Multiline = i ? true : false;
    this.form.Global = g ? true : false;
    this.form.IgnoreCase = m ? true : false;
    this.updateRegExpObject();
}

_RegExpEditor.prototype.setTextWindow = function (textWindow) {
    this.textWindow = textWindow;
    if (this.textWindow && this.textWindow.IsActive())
    {
        var pattern = this.textWindow.GetStringUnderCursor();
        if (pattern)
            this.initRegExpFormProps(pattern);
    }
}

////} RegExpEditor

////////////////////////////////////////////////////////////////////////////////////////
////{ RegExpEditor - �������

_RegExpEditor.prototype.fillHelpers = function () {
    this.form.RegExpHelpers.Clear();
    this.addHelper('\\s', '������ ����� ���������� ������, ������� ������, ���������, �������� ������ � ������ ��������� ���������� �������.');
    this.addHelper('\\S', '������ ����� ������, ����� �����������.');
    this.addHelper('\\w', '������ ����� ��������� (��������� �������) ������, ������� �����, ����� � ���� �������������. ������������ [A-Za-z0-9_].');
    this.addHelper('\\W', '������ ����� ��-(���.)��������� ������. ������������ [^A-Za-z0-9_].');
    this.addHelper('\\d', '������� ����� �� ������ ��������. ���������� [0-9], ����� ����� ������ ������� �����.');
    this.addHelper('\\D', '������ ���������� ������ (��� ��������). [^0-9] - ���������� ��� ������� ����.');
    this.addHelper('\\n', '���������� �������� ������.');
    this.addHelper('.', '(���������� �����) ���������� ����� ������, ����� �������� ������: \\n \\r \\u2028 ��� \\u2029.');
    this.addHelper('\\', '��� ������� �������� - ������ �� ������������. ��������, ��������� /s/ ���� ������ ������ "s". � ���� ��������� \\ ����� s, �� /\\s/ ��� ���������� ���������� ������.� ��������, ���� ������ �����������, �������� *, �� \\ ������� ��� ������ ������� �������� "���������".');    
    this.addHelper('^', '���������� ������ ������� ������. ���� ���������� ���� �������������� ������ ("m"), �� ����� ��������� ��� ������ ����� ������.');
    this.addHelper('$', '���������� ����� ������� ������. ���� ���������� ���� �������������� ������, �� ����� ��������� � ����� ������.');
    this.addHelper('*', '���������� ���������� 0 ��� ����� ���.');
    this.addHelper('+', '���������� ���������� 1 ��� ����� ���. ������������ {1,}.');
    this.addHelper('?', '����������, ��� ������� ����� ��� ��������������, ��� � �������������.');
    this.addHelper('{n}', '��� n - ������������� ����� �����. ������� ����� n ���������� ��������������� ��������.');
    this.addHelper('{n,}', '��� n - ������������� ����� �����. ������� n � ����� ���������� ��������.');
    this.addHelper('{n,m}', '��� n � m - ������������� ����� �����. ������� �� n �� m ���������� ��������.');
    this.addHelper('(x)', '������������ �����������. ������� ������ x � ����������.');
    this.addHelper('(?:x)', '�������������� �����������. ������� ������ x, �� �� ����������.');
    this.addHelper('x(?=y)', '������� x, ������ ���� �� x ������� y.');
    this.addHelper('x(?!y)', '������� x, ������ ���� �� x �� ������� y. ��������, /\d+(?!\.)/ ������ �����, ������ ���� �� ��� �� ������� ���������� �����.');
    this.addHelper('x|y', '������� x ��� y.');
    this.addHelper('[xyz]', '����� ��������. ������� ����� �� ������������� ��������. �� ������ ������� ����������, ��������� ����. ��������, [abcd] - �� �� �����, ��� [a-d].');
    this.addHelper('[^xyz]', '����� ������, ����� ��������� � ������. �� ����� ������ ������� ����������. ��������, [^abc] - �� �� �����, ��� [^a-c].');
    this.addHelper('[\\b]', '������� ������ backspace. (�� ������ � \\b.)');
    this.addHelper('\\b', '������� ������� ���� (���������), �������� ������. (�� ������ � [\b]).');
    this.addHelper('\\B', '���������� �� ������� ����.');
    this.addHelper('\\cX', '��� X - ����� �� A �� Z. ���������� ����������� ������ � ������. ��������, /\\cM/ ���������� ������ Ctrl-M.');
    this.addHelper('\\f', '���������� form-feed.');
    this.addHelper('\\v', '���������� ������������ ���������.');
    this.addHelper('\\m', '��� m - ����� �����. �������� ������ �� m-� ����������� �����������.');
    this.addHelper('\\0', '���������� NUL. �� ���������� � ����� ������ �����.');
    this.addHelper('\\xHH', '������ ������ � ����� HH (2 ����������������� �����)');
    this.addHelper('\\uHHHH', '������ ������ � ����� HHHH (4 ����������������� �����).');

    //this.addHelper('([\\w-\\.]+)@((?:[\\w]+\\.)+)([a-zA-Z]{2,4})', '���� � ������ ����� ������������ (email).', '�������');
    //this.addHelper('\{[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}\}', '���� GUID', '�������');
    //this.addHelper('(\d+)(((.|,)\d+)+)?', '���� � ������ �����');    
    //this.addHelper('', '');    
}

_RegExpEditor.prototype.addHelper = function (pattern, hint, category) {
    var row = this.form.RegExpHelpers.Add();
    row.Pattern = pattern;
    row.Hint = hint;
    row.category = category ? category : '����������';
}
////} _RegExpEditor - �������

////////////////////////////////////////////////////////////////////////////////////////
////{ _RegExpEditor - ����������� ������� �����
////

_RegExpEditor.prototype.OnOpen = function () {
    if (!this.textWindow)
        this.form.Controls.btOk.Visible = false;
}

_RegExpEditor.prototype.RegExSourceOnChange = function (Control) {
    this.updateRegExpObject();
}

_RegExpEditor.prototype.IgnoreCaseOnChange = function (Control) {
    this.updateRegExpObject();
}

_RegExpEditor.prototype.GlobalOnChange = function (Control) {
    this.updateRegExpObject();
}

_RegExpEditor.prototype.MultilineOnChange = function (Control) {
    this.updateRegExpObject();
}

_RegExpEditor.prototype.ResultTreeOnRowOutput = function (Control, RowAppearance, RowData) {
    var isHeader = (RowData.val.Parent == undefined);
    RowAppearance.val.Cells.GroupHeader.Visible = isHeader;
    RowAppearance.val.Cells.ResultValue.Visible = !isHeader;
    RowAppearance.val.Cells.ResultName.Visible = !isHeader;
}

_RegExpEditor.prototype.TestStringOnChange = function (Control) {
    this.updateRegExpObject();
}

_RegExpEditor.prototype.TreeCmdBarExpandAll = function (Control) {
    this.expandMatches();
}

_RegExpEditor.prototype.TreeCmdBarCollapseAll = function (Control) {
    this.collapseMatches();
}

_RegExpEditor.prototype.TreeCmdBarUpdateResults = function (Control) {
    this.updateRegExpObject();
}

_RegExpEditor.prototype.RegExpHelpersSelection = function (Control, SelectedRow, Column, DefaultHandler) {
	this.form.RegExSource += SelectedRow.val.Pattern;
}

_RegExpEditor.prototype.RegExpHelpersOnActivateRow = function (Control) {
    var curRow = this.form.Controls.RegExpHelpers.CurrentData;
    this.form.HelpersHint = curRow ? curRow.Hint : '';
}

_RegExpEditor.prototype.btHelpClick = function (�������) {
    RunApp('http://snegopat.ru/');
}

_RegExpEditor.prototype.btOkClick = function (�������) {
    if (this.textWindow && this.textWindow.IsActive()) 
    {
        var pattern = this.getPattern();
        // ���������� ������� �������.
        pattern = pattern.replace(/\"/g, '""');
        this.textWindow.SetSelectedText(pattern);
    }
    this.form.Close();
    this.form = null;
}

////} RegExpEditor - ����������� ������� �����


