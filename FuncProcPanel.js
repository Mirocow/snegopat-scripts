$engine JScript
$uname funcprocpanel
$dname ������ ����/���� � ������������ �� ��������� ����������
$addin vbs
$addin global
$addin stdlib
$addin stdcommands

// (c) ����� ������� <shenja@sosna.zp.ua>
// ������ ��� ������ "������ ��������".
// � ������� �� ������� ������ ���� ���������� ������ ��������/������� � ��������� ����, 
// �������� � ��������� ����������� �������� ���������/���������

stdlib.require('SyntaxAnalysis.js', SelfScript);
stdlib.require('TextWindow.js', SelfScript);
stdlib.require('SettingsManagement.js', SelfScript);


global.connectGlobals(SelfScript)

////////////////////////////////////////////////////////////////////////////////////////
////{ �������
////

SelfScript.self['macros������� ����'] = function() {
    GetFuncProcPanel().Show();
}
/* ���������� �������� ������� �� ��������� - ����������, ����� ������������ 
������ ������� ����� �� �������� ������� � ���� ���������. */
function getDefaultMacros() {
    return '������� ����';
}

////} �������


function FuncProcPanel() {
    
    FuncProcPanel._instance = this;
    
    this.form = loadScriptForm("scripts\\FuncProcPanel.ssf", this);
    this.form.��������������������������� = "FuncProcPanel.js"
    this.results = this.form.FunctionList;
    this.results.Columns.Add('_method');
    //�������, �� ��������� ������� ����� ������ ��� ������ ��� ������ ������... 
    this.methods = this.results.Copy();
    
    this.watcher = new TextWindowsWatcher();
    this.watcher.startWatch();
    
    this.isForm = false;
    this.defaultSettings = {
        'TreeView'      : false // ������������ ���������� ������ �� ����������.
    };
    //this.tc = new TextChangesWatcher(this.form.�������������.������������, 3, this.viewFunctionList);
    
    this.settings = SettingsManagement.CreateManager(SelfScript.uniqueName, this.defaultSettings);
    this.settings.LoadSettings();
    this.settings.ApplyToForm(this.form);
    
    this.targetWindow = null;
    
    this.lastFilter = '';
    
    this.groupsCache = v8New("Map");
    
    this.Icons = {
        'Func': this.form.Controls.PicFunc.Picture,
        'Proc': this.form.Controls.PicProc.Picture
    }
}

FuncProcPanel.prototype.Show = function () {
    
    this.form.Open();
    //this.tc.start();
    //this.tc.stop();
    
}

FuncProcPanel.prototype.Close = function () {
    if (this.form.IsOpen())
    {
        this.form.Close();
        return true;
    }
    return false;
}

FuncProcPanel.prototype.IsOpen = function () {
    return this.form.IsOpen();
}

FuncProcPanel.prototype.GetList = function () {
            
    this.methods.Rows.Clear();
    this.targetWindow = this.watcher.getActiveTextWindow();
    
    // ��������, ��� ��� �����.
    // �������� mdProp ����������, � ������ �������� ������� ���������� ��������� ����
    //debugger
    this.isForm = (this.targetWindow.textWindow.mdProp.name(1) == "�����")

    cnt = SyntaxAnalysis.AnalyseTextDocument(this.targetWindow);
    vtModules = cnt.getMethodsTable();
    for (var i = 0; i<vtModules.Count(); i++) {
        var thisRow = vtModules.Get(i);
        var newRow = this.methods.Rows.Add();
        newRow.LineNo = thisRow.StartLine;
        newRow.Method = thisRow.Name;
        newRow.Context =this.isForm?thisRow.Context:" ";
        newRow._method = thisRow._method;
    }
    this.methods.Rows.Sort("Context, LineNo");
    
}

FuncProcPanel.prototype.beforeExitApp = function () {
    this.watcher.stopWatch();
}
FuncProcPanel.prototype.OnOpen = function() {
    this.GetList();
    this.viewFunctionList(this.������������);
    events.connect(Designer, "onIdle", this)
}
FuncProcPanel.prototype.OnClose= function() {
    this.results.Rows.Clear();
    events.disconnect(Designer, "onIdle", this)
    //this.tc.stop();
}
FuncProcPanel.prototype.CmdBarTreeView = function (Button) {
    this.form.TreeView = !this.form.TreeView;
    Button.val.Check = this.form.TreeView;
    //this.form.Controls.SearchResults.Columns.FoundLine.ShowHierarchy = this.form.TreeView;
    //this.switchView(this.form.TreeView);
    this.viewFunctionList(this.������������);
}
FuncProcPanel.prototype.expandTree = function () {
    if (this.form.TreeView)
    {
        for (var rowNo=0; rowNo < this.results.Rows.Count(); rowNo++)
            this.form.Controls.FunctionList.Expand(this.results.Rows.Get(rowNo), true);
    }
}

FuncProcPanel.prototype.getGroupRow = function (methodData) {

    if (!this.form.TreeView)
        return this.results;

    var groupRow = this.groupsCache.Get(methodData);
    if (!groupRow) 
    {
        groupRow = this.results.Rows.Add();
        groupRow.Method = methodData;
        this.groupsCache.Insert(methodData, groupRow); 
    }
    return groupRow;
}

FuncProcPanel.prototype.Filter = function(filterString){
    filterString = filterString.toLowerCase()
    if (filterString!=this.lastFilter){
        this.lastFilter = filterString;
        this.viewFunctionList(filterString);
    }
}
FuncProcPanel.prototype.viewFunctionList = function(newFilter) {
    
    //FIXME: ��� undefined �� ������ ����...
    
    currentFilter = (newFilter!=undefined)?newFilter:'' //���������, ���� � �������� ��������, ������ ��� undefined 
    //Message(currentFilter)
    //debugger;
    
    this.results.Rows.Clear();
    this.groupsCache.Clear();
    var filters = currentFilter.split(/\s+/)
    
    for (var i = 0; i<this.methods.Rows.Count(); i++) {
        
        var thisRow = this.methods.Rows.Get(i);
        var needAdd = true;
        var Method = thisRow.Method.toLowerCase()
        if (currentFilter.length>0) {
            for(var s in filters)
            {
                if(Method.indexOf(filters[s]) < 0) {
                    needAdd = false
                    break;
                }
            }
        }
        if(!needAdd) continue
        
        var groupRow = this.getGroupRow(thisRow.Context);
        var newRow = groupRow.Rows.Add();
        newRow.LineNo = thisRow.LineNo;
        newRow.Method = thisRow.Method;
        newRow.Context = thisRow.Context;
        newRow.RowType = thisRow._method.IsProc ? RowTypes.ProcGroup : RowTypes.FuncGroup;
    }
    this.expandTree();
    this.form.Controls.FunctionList.Columns.Context.Visible = (!this.form.TreeView && this.isForm);
}

FuncProcPanel.prototype.CmdBarActivate = function(Button){
    this.goToLine(this.form.Controls.FunctionList.CurrentRow);
}

FuncProcPanel.prototype.activateEditor = function () {
    if (!snegopat.activeTextWindow())
        stdcommands.Frame.GotoBack.send();
}

FuncProcPanel.prototype.goToLine = function (row) {

    this.form.Controls.FunctionList.CurrentRow = row;

    if (!this.targetWindow)
        return;
 
    if (!this.targetWindow.IsActive())
    {
        DoMessageBox("����, ��� �������� ���������� �����, ���� �������!\n���� ������ � ������������ ����� �� ��������� � ����� �������.");
        //this.clearSearchResults();
        this.Close();
        return;
    }
 
    // ��������� ����� � ���� ���������� ���������.
    this.activateEditor();

    // ������ ������� ���������� ����� � ������.
    //var searchPattern = this.form.WholeWords ? "(?:[^\\w\\d�-�]|^)" + row.ExactMatch + "([^\\w\\d�-�]|$)" : StringUtils.addSlashes(row.ExactMatch); 
    //var re = new RegExp(searchPattern, 'g');
    //var matches = re.exec(row.FoundLine);
    
    // ��������� ��������� �� ��������� ���������� �� ������� ������.
    this.targetWindow.SetCaretPos(row.LineNo, 1);
    
}

FuncProcPanel.prototype.FuncProcOnRowOutput = function(Control, RowAppearance, RowData) {
    var cell = RowAppearance.val.Cells.Method;
    
    switch (RowData.val.RowType)
    {
    case RowTypes.FuncGroup:
        cell.SetPicture(this.Icons.Func);
        break;
    
    case RowTypes.ProcGroup:
        cell.SetPicture(this.Icons.Proc);
        break;
        
    default:
        break;
    }
    
    //if (RowData.val._method.IsProc !== undefined)
    //    RowAppearance.val.Cells.Method.SetPicture(RowData.val._method.IsProc ? this.Icons.Proc : this.Icons.Func);
    
}

FuncProcPanel.prototype.FuncProcOnSelection = function(�������, ���������������, �������, ��������������������) {
    this.goToLine(���������������.val);
    ��������������������.val = false; // ��� ��� ���� ����� ����� ������� �� ������ ������ �� ������ � ���������� ����, � ��� ����� ����������� ����� ����� ���� �������� ���������� ������ ��������
}

FuncProcPanel.prototype.onIdle = function(){
    this.updateList();
}

FuncProcPanel.prototype.updateList = function()
{
    // ������� ������� ����� �� ���� �����
    FuncPanel = GetFuncProcPanel();
    vbs.var0 = this.form.Controls.������������;
    vbs.DoExecute("var0.GetTextSelectionBounds var1, var2, var3, var4")
    this.form.Controls.������������.��������������������������(1, 1, 1, 10000)
    var newText = this.form.Controls.������������.���������������.replace(/^\s*|\s*$/g, '')
    this.form.Controls.������������.��������������������������(vbs.var1, vbs.var2, vbs.var3, vbs.var4)
    this.Filter(newText);
}
// ����� ��� ������������ ��������� ������ � ���� �����, ��� ������
// ������� ����������������. ������� ������� ����� ���, ��� �� ���������
// - ��� ��������� ������� ������
// - ��� ��������� ������ ����� �������/��������� ��/� ������ ������
// - ��� ������ �������������� (Ctrl+Z)
// �� ��������� ������������ ��������
// ��������� ������������
// field - ������� ���������� ���� �����, ��� ��������� ����� �����������
// ticks - �������� �������� ����� ����� ������ � ������� ������� (�.�. 3 - 300 ����)
// invoker - ������� ��������� ������, ���������� ����� ��������� ��������� ������,
//  ����� ����� ���������� ���������� �������
function TextChangesWatcher(field, ticks, invoker)
{
    this.ticks = ticks
    this.invoker = invoker
    this.field = field
}

// ������ ������������ ��������� ������
TextChangesWatcher.prototype.start = function()
{
    this.lastText = this.field.��������.replace(/^\s*|\s*$/g, '').toLowerCase()
    this.noChangesTicks = 0
    this.timerID = createTimer(100, this, "onTimer")
}
// ���������� ������������ ��������� ������
TextChangesWatcher.prototype.stop = function()
{
    killTimer(this.timerID)
}
// ���������� ������� �������
TextChangesWatcher.prototype.onTimer = function()
{
    // ������� ������� ����� �� ���� �����
    vbs.var0 = this.field
    vbs.DoExecute("var0.GetTextSelectionBounds var1, var2, var3, var4")
    this.field.��������������������������(1, 1, 1, 10000)
    var newText = this.field.���������������.replace(/^\s*|\s*$/g, '').toLowerCase()
    this.field.��������������������������(vbs.var1, vbs.var2, vbs.var3, vbs.var4)
    // ��������, ��������� �� ����� �� �������� � ������� �����
    if(newText != this.lastText)
    {
        // ���������, �������� ���
        this.lastText = newText
        this.noChangesTicks = 0
    }
    else
    {
        // ����� �� ���������. ���� �� ��� �� ��������������� �� ����, �� �������� ������� �����
        if(this.noChangesTicks <= this.ticks)
        {
            if(++this.noChangesTicks > this.ticks)  // �������� ��������� ���������� �����.
                this.invoker(newText)               // �����������
        }
    }
}

////////////////////////////////////////////////////////////////33////////////////////////
////{ TextWindowsWatcher - ����������� ����������� ��������� ���� � ���������� ���������.
////

function TextWindowsWatcher() {
    this.timerId = 0;
    this.lastActiveTextWindow = null;
    this.startWatch();
}

TextWindowsWatcher.prototype.getActiveTextWindow = function () {
    if (this.lastActiveTextWindow && this.lastActiveTextWindow.IsActive())
        return this.lastActiveTextWindow;
    return null;
}

TextWindowsWatcher.prototype.startWatch = function () {
    if (this.timerId)
        this.stopWatch();
    this.timerId = createTimer(500, this, 'onTimer');
}

TextWindowsWatcher.prototype.stopWatch = function () {
    if (!this.timerId)
        return;
    killTimer(this.timerId);
    this.timerId = 0;
}

TextWindowsWatcher.prototype.onTimer = function (timerId) {
    var wnd = GetTextWindow();    
    if (wnd)
        this.lastActiveTextWindow = wnd;
    else if (this.lastActiveTextWindow && !this.lastActiveTextWindow.IsActive())
        this.lastActiveTextWindow = null;
}
//} TextWindowsWatcher 

////////////////////////////////////////////////////////////////////////////////////////
////{ StartUp
////
function GetFuncProcPanel() {
    if (!FuncProcPanel._instance)
        new FuncProcPanel();
    
    return FuncProcPanel._instance;
}

RowTypes = {
    'ProcGroup'     : 1,
    'FuncGroup'     : 2
}
events.connect(Designer, "beforeExitApp", GetFuncProcPanel());
////}