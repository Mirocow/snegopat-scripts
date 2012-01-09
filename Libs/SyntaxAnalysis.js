$engine JScript
$uname SyntaxAnalysis
$dname ����� SyntaxAnalysis
$addin global
$addin stdlib

////////////////////////////////////////////////////////////////////////////////////////
////{ C�����-���������� SyntaxAnalysis (SyntaxAnalysis.js) ��� ������� "��������"
////
//// ��������: ��������� ���������� �� c�������������� ������� ��������� ���� �� 
//// ���������� ����� 1�:����������� 8.
//// 
//// �������� �� �������� ���� ���������� SyntaxAnalysis.wsc ��� ������� OpenConf.
////
//// ����� SyntaxAnalysis.wsc: ������� ����� <adirks@ngs.ru>  
//// ����� �����: ��������� �������� <kuntashov@gmail.com>, http://compaud.ru/blog
////}
////////////////////////////////////////////////////////////////////////////////////////

SyntaxAnalysis = {};

SyntaxAnalysis.AnalyseTextDocument = function (textWindow) {
    return new _1CModule(textWindow)
}

SyntaxAnalysis.Create1CModuleContextDescription = function(initValueTable) {
    return new _1CModuleContextDescription(initValueTable);
}

SyntaxAnalysis.Create1CMethodDescription = function(parentModule) {
    return new _1CMethodDescription(parentModule);
}

////////////////////////////////////////////////////////////////////////////////////////
////{ ���������� ��������� ��� ������ ����������� ����������� ����� 1�.
////TODO: 
////    - ������� �� ��������� ����������� ������ ����� - �� ����� ������ ��� 8.�
////    - ������� ������� � ���������� �����������, ������� ����, ��� ������� ��� RE_VAR.
SyntaxAnalysis.RE_COMMENT       = new RegExp('^\\s*((?:(?:(?:"[^"]")*)|(?:[^/]*)|(?:[^/]+/))*)(//.*)?\\s*$', "");
/* �����������: 1: ���������� ������ (���������/�������), 2: ��� ������, 3: ������ ���������� ������ �������, 4: "�����" - ����� ����� ������ ��� 7.7. */
SyntaxAnalysis.RE_PROC          = new RegExp('^\\s*((?:procedure)|(?:function)|(?:���������)|(?:�������))\\s+([\\w�-���\\d]+)\\s*\\(([\\w�-���\\d\\s,.="\']*)\\)\\s*((?:forward)|(?:�����))?(.*)$', "i");
SyntaxAnalysis.RE_PARAM         = new RegExp('(?:(?:Val)|(?:����)\\s+)?([\\w�-���\\d]+)(\\s*=\\s*(?:(?:"[^"]")|(?:[^,)]*))*)?', "ig");
SyntaxAnalysis.RE_PROC_END      = new RegExp('((?:EndProcedure)|(?:EndFunction)|(?:��������������)|(?:������������))', "i");
SyntaxAnalysis.RE_VARS_DEF      = new RegExp('^\\s*(?:(?:Var)|(?:�����))\\s*([\\w�-���\\d,=\\[\\]\\s]*)(\\s+�������\\s*)?([\\s;]*)(.*?)$', "i");
/* �����������: 1: ��� ����������, 2: ����������� ����������� �������, 3: �������, 4: �������� ������ ("," ��� ����� - ����� ������). */
SyntaxAnalysis.RE_VAR           = new RegExp('([\\w�-���\\d]+)\\s*(\\[[\\d\\s,]*\\])?(\\s+�������\\s*)?(?:\\s*(?:,|;|$))', "ig");
SyntaxAnalysis.RE_VAR_ASSIGN    = new RegExp('([\\w�-���\\d.]+)\\s*=\\s*(([^;]*);)?', "g");
SyntaxAnalysis.RE_CALL          = new RegExp('([\\w�-���\\d.]+)\\s*\\(', "g");
SyntaxAnalysis.RE_SPACE         = new RegExp('\\s+', "g");
//SyntaxAnalysis.RE_CRLF          = new RegExp('[\\n]+', "");
////} ���������� ��������� ��� ������ ����������� ����������� ����� 1�.
    
SyntaxAnalysis.AnalyseModule = function (sourceCode, initValueTable) {
    
    var Meth;
    var stStart = 0, stInProc = 1, stInModule = 2, stInVarsDef;
    var state = stStart, PrevState;
    var Match;
    
    var moduleContext = SyntaxAnalysis.Create1CModuleContextDescription(initValueTable);
        
    var proc_count = 0;
 //debugger;
    var Lines = sourceCode.split("\n");
    var n = Lines.length;
    var i = 0; 
    var nextPart = '';
    while (i < n)
    {
        var str = '';
        
        if (nextPart) 
        {
            str = nextPart;
        }
        else
        {
            str = Lines[i];
            var Matches = SyntaxAnalysis.RE_COMMENT.exec(str);
            if( Matches != null )
                str = Matches[1];
        }
        
        switch( state )
        {
        case stStart:        
        case stInModule:
        
            Matches = SyntaxAnalysis.RE_PROC.exec(str);
            if( Matches != null )
            {
                var forward = Matches[4];
                var endproc = Matches[5];
                if( forward == "" )
                {
                    Meth = SyntaxAnalysis.Create1CMethodDescription(moduleContext);
                    Meth.Name = Matches[2];
                    Meth.StartLine = i;                    
                    Meth.IsProc = (Matches[1].toLowerCase() == '���������' || Matches[1].toLowerCase() == 'procedure');
                    
                    str = Matches[3];
                    while( (Matches = SyntaxAnalysis.RE_PARAM.exec(str)) != null )
                        Meth.Params.push(Matches[1]);
                    
                    moduleContext.addMethod(Meth);
                    proc_count++;
                    state = stInProc;
                    if( (Match = SyntaxAnalysis.RE_PROC_END.exec(endproc)) != null )
                    {
                        state = stInModule;
                        nextPart = endproc.substr(SyntaxAnalysis.RE_PROC_END.lastIndex);
                        if (nextPart)
                            continue;
                    }
                }
            }
            else if ((Matches = SyntaxAnalysis.RE_VARS_DEF.exec(str)) != null)
            {
                str = Matches[1];
                nextPart = Matches[4];
                while( (Matches = SyntaxAnalysis.RE_VAR.exec(str)) != null )
                {
                    if( PrevState == stInProc )
                        Meth.addVar(Matches[1]);
                    else
                        moduleContext.addVar(Matches[1]);
                }
                
                if (nextPart)
                    continue;
                
                str = str.replace(SyntaxAnalysis.RE_SPACE, "");
                if( str.substr(str.length-1) == ";" )
                {
                    state = PrevState;
                } 
                else if (str.substr(str.length-1) == ",")
                {
                    PrevState = state;
                    state = stInVarsDef;
                }
                break;            
            }
            break;
            
        case stInProc:
        
            Matches = SyntaxAnalysis.RE_PROC_END.exec(str);
            if( Matches != null )
            {
                if( state == stInProc ) Meth.EndLine = i;
                state = stInModule;
            }
            else if( (Matches = SyntaxAnalysis.RE_VARS_DEF.exec(str)) != null )
            {
                var exported = Matches[2];
                var semicolon = Matches[3].replace(SyntaxAnalysis.RE_SPACE, "");
                str = Matches[1];
                while( (Matches = SyntaxAnalysis.RE_VAR.exec(str)) != null )
                {
                    if( state == stInProc )
                        Meth.addVar(Matches[1]);
                    else
                        moduleContext.addVar(Matches[1]);
                }
                if( semicolon != ";" )
                {
                    PrevState = state;
                    state = stInVarsDef;
                }
            }
            else
            {
                while( (Matches = SyntaxAnalysis.RE_VAR_ASSIGN.exec(str)) != null )
                {
                    var varName = Matches[1];                    
                    
                    if( varName.indexOf(".", 0) >= 0 ) continue;
                    
                    if (state == stInProc)
                        Meth.addVar(varName, null, true); // automatic var
                    else
                        moduleContext.addVar(varName);
                }
                
                if( state == stInProc )
                {
                    while( (Matches = SyntaxAnalysis.RE_CALL.exec(str)) != null )
                    {
                        if( Matches[1].indexOf('.') >= 0 ) continue;
                        if( Meth.Calls.indexOf(Matches[1]) >= 0) continue;
                        Meth.Calls.push(Matches[1]);
                    }
                }
            }
            break;  

        case stInVarsDef:
        
            while( (Matches = SyntaxAnalysis.RE_VAR.exec(str)) != null )
            {
                if( PrevState == stInProc )
                    Meth.addVar(Matches[1]);
                else
                    moduleContext.addVar(Matches[1]);
            }
            str = str.replace(SyntaxAnalysis.RE_SPACE, "");
            if( str.substr(str.length-1) == ";" )
                state = PrevState;
            break;
            
        }
        
        i++;
        nextPart = '';
    }

    return moduleContext;
}

////////////////////////////////////////////////////////////////////////////////////////
////{ _1CModule

function _1CModule(textWindow) {
    this.textWindow = textWindow;
    this.context = SyntaxAnalysis.AnalyseModule(this.textWindow.GetText(), true);
}

/* ���������� �������� ��� ������ �� �������� ������. */
_1CModule.prototype.getMethodSource = function(methodName) {
    var method = this.context.getMethodByName(methodName);
    if (!method) return undefined;
    return this.textWindow.Range(method.StartLine + 1, 1, method.EndLine + 1).GetText();
}

/* ���������� ������� �������� � ���������� ������� ������. */
_1CModule.prototype.getMethodsTable = function() {
    return this.context._vtAllMethods;
}

/* ���������� �������� ������ �� ������ ������, ����������� ������ ������. */
_1CModule.prototype.getMethodByLineNumber = function (lineNo) {

    var methods = this.context.Methods;
    
    for (var i=0; i<methods.length; i++)
    {
        /* ������, ��� ��������� ����� ���������� � 1, 
        � ������ ������ � SyntaxAnalysis ���������������� � 0. */
        if (methods[i].StartLine + 1 <= lineNo && lineNo <= methods[i].EndLine + 1)
            return methods[i];
    }
    
    return undefined;
}

/* ���������� �������� ������, �������� ����������� ������� ������ 
(������, � ������� ��������� ������). */
_1CModule.prototype.getActiveLineMethod = function () {
    var pos = this.textWindow.GetCaretPos();
    return this.getMethodByLineNumber(pos.beginRow);
}

////} _1CModule

////////////////////////////////////////////////////////////////////////////////////////
////{ _1CModuleContextDescription

function _1CModuleContextDescription(initValueTable) {

    // ������ ���� ������� ������.
    this.Methods = new Array();
        
    // ������������� ������ ��� ������ -> _1CMethodDescription
    this._methodsByName = {};
    
    // ������ ���� ����� ������� ����������� ���������� ������.
    this.ModuleVars = new Array();        
    
    // ������������� ������ ��� ���������� -> ��� ���������� (���� ��� ������ null).
    this._moduleVarsTypes = {};
    
    this._vtAllMethods = null;
    if (initValueTable) 
    {
        var v8Type_String = v8New('TypeDescription', '������', undefined, v8New('StringQualifiers', 255));
        var v8Type_Number = v8New('TypeDescription', '�����', v8New('NumberQualifiers', 10, 0));
        var v8Type_Boolean = v8New('TypeDescription', '������');
    
        this._vtAllMethods = v8New('ValueTable');
        var cols = this._vtAllMethods.Columns;
        // ��������� �������.
        cols.Add('Name', v8Type_String, '��� ���������/�������');
        cols.Add('IsProc', v8Type_Boolean, '���������');
        cols.Add('StartLine', v8Type_Number, 'N ������ ������');
        cols.Add('EndLine', v8Type_Number, 'N ��������� ������');
        cols.Add('_method'); // _1CMethodDescription
    }
}

_1CModuleContextDescription.prototype.addMethod = function (method) {

    if (this._methodsByName[method.name])
        Message('����� ' + method.name + '��� ��� �������� ����� � ���� ������!');
        
    this.Methods.push(method);
    this._methodsByName[method.Name] = method;
    
    // ��������� ����� � ������� ��������.
    if (this._vtAllMethods) 
    {
        var methRow = this._vtAllMethods.Add();
        methRow.Name = method.Name;
        methRow.IsProc = method.IsProc;
        methRow.StartLine = method.StartLine;
        methRow.EndLine = method.EndLine;
        methRow._method = method;
    }
}

_1CModuleContextDescription.prototype.getMethodByName = function (name) {
    return this._methodsByName[name];
}

_1CModuleContextDescription.prototype.addVar = function (name, type, auto) {
    if (this._moduleVarsTypes[name] === undefined)
    {
        this._moduleVarsTypes[name] = (type === undefined) ? null : type;
        this.ModuleVars.push(name);
    }
}

_1CModuleContextDescription.prototype.getVarType = function (name) {
    return this._moduleVarsTypes[name];
}

////} _1CModuleContextDescription

////////////////////////////////////////////////////////////////////////////////////////
////{ _1CMethodDescription

function _1CMethodDescription(parentModule) {
        
    // ������������� (���) ������.
    this.Name = "";
    
    // ��� ������. ���� ������ - �� ��� ���������, ����� - ��� �������.
    this.IsProc = false;

    // ������ ���������� ������.
    this.Params = new Array();
    
    // ������ ����� ������� ����������� ����������.
    this.DeclaredVars = new Array();
    
    // ������ �������������� ��������� ���������� (�� ����������� ����� �������).
    this.AutomaticVars = new Array();
    
    // ������ �������: ������ �������, ���������� �� ������� ������.
    this.Calls = new Array();
    
    // ����� ������ ���������� ������.
    this.StartLine = 0;
    
    // ����� ������ ���������� ���������� ������.
    this.EndLine = 0;
    
    // ������������� ������ ��� ���������� -> ��� ���������� (���� ��� ������ null).
    this._varsTypes = {};
    
    // �������� ������, � ������� �������� ������ ����� (_1CModuleContextDescription).
    this.parentModule = parentModule;
}

_1CMethodDescription.prototype.addVar = function (name, type, auto) {
        
    if (this._varsTypes[name] === undefined)
    {    
        if (this.Params.indexOf(name) >= 0) 
            return;
            
        if (this.parentModule && this.parentModule.getVarType(name) !== undefined) 
            return;
    
        this._varsTypes[name] = (type === undefined) ? null : type;
        
        if (auto)
            this.AutomaticVars.push(name);
        else
            this.DeclaredVars.push(name);
    }
}

_1CMethodDescription.prototype.getVarType = function (name) {
    return this._varsTypes[name];
}


////} _1CMethodDescription

////////////////////////////////////////////////////////////////////////////////////////
////{ ��������������� ������� ������� Array
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        for(var i = fromIndex||0, length = this.length; i<length; i++)
            if(this[i] === searchElement) return i;
        return -1
    };
};
////} ��������������� ������� ������� Array