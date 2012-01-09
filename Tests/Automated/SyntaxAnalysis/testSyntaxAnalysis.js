$engine JScript
$uname testSyntaxAnalysis
$dname ����� ��� ������ SyntaxAnalysis
$addin global
$addin stdcommands
$addin stdlib

stdlib.require('jsUnitCore.js', SelfScript);
stdlib.require('SyntaxAnalysis.js', SelfScript);
    
//{ setUp/tearDown    
function setUp() {
}

function tearDown() {
}
//} setUp/tearDown

//{ tests of AnalyseModule
function macrosTestAnalyseModule1() {

    var moduleText = ""
        + "����� �����������������;\n\n"
        + "����� �����������������;\n"
        + "����� �������������������� �������;\n"
        + "����� ����������������[10] �������, ���������������[3], ����������������;\n"
        + "��������� ������������(�����1, �����2)\n"
        + "	����� ��������1;\n\n"	
        + "	��������1 = 42;\n\n"
        + "	������������������������ = 10;\n"	
        + "	����������������� = \"\";\n"	
        + "��������������\n\n"
        + "������� ����������(���������������)\n"
        + "	��������(�����������������);	\n"
        + "	������� ������;	\n"
        + "������������\n\n"
        + "������������(1, 2);\n"
        + "��������� = ����������();\n"
//debugger;
    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
        
    //Message(cnt.ModuleVars.join(','));
            
    assertEquals('����������� ���������� ���������� ���������� ������!', 6, cnt.ModuleVars.length);
    assertArrayEqualsIgnoringOrder('����������� ��������� ������ ���������� ������!',
        ['�����������������', '�����������������', '��������������������', 
        '����������������', '���������������', '����������������'], cnt.ModuleVars);

    assertEquals('����������� ���������� ���������� �������!', 2, cnt.Methods.length);
        
    assertUndefined(cnt.getMethodByName('�������������������'));
    
    var method = cnt.getMethodByName('����������');
    assertNotUndefined("����� ���������� �� ������", method);    
    assertArrayEqualsIgnoringOrder(['���������������'], method.Params);
    assertFalse(method.IsProc)

    var proc = cnt.getMethodByName('������������');
    assertNotNull("����� ������������ �� ������", proc);    
    assertArrayEqualsIgnoringOrder(['�����1', '�����2'], proc.Params);
    assertTrue(proc.IsProc)
    
}

function macrosTestAnalyseModule2_����������������() {

    var moduleText = ""
        + "����� �����������������;\n\n"
        + "����� �����������������;\n"
        + "����� �������������������� �������;\n"
        + "����� ����������������[10] �������, ���������������[3], ����������������;\n"

    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
            
    assertEquals('����������� ���������� ���������� �������!', 0, cnt.Methods.length);
    
    assertEquals('����������� ���������� ���������� ���������� ������!', 6, cnt.ModuleVars.length);
    assertArrayEqualsIgnoringOrder('����������� ��������� ������ ���������� ������!',
        ['�����������������', '�����������������', '��������������������', 
        '����������������', '���������������', '����������������'], cnt.ModuleVars);
}

function macrosTestAnalyseModule3_���������������������������() {

    var moduleText = ""
        + "����� �����������������, �����������������, �������������������� �������,"
        + "����������������[10] �������, ���������������[3], ����������������";
//debugger;
    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
            
    assertEquals('����������� ���������� ���������� �������!', 0, cnt.Methods.length);
    
    assertEquals('����������� ���������� ���������� ���������� ������!', 6, cnt.ModuleVars.length);
    assertArrayEqualsIgnoringOrder('����������� ��������� ������ ���������� ������!',
        ['�����������������', '�����������������', '��������������������', 
        '����������������', '���������������', '����������������'], cnt.ModuleVars);
}

function macrosTestAnalyseModule4_�����������������������������������() {

    // ���� ������.

    var moduleText = ""
        + "����� �����������������, �����������������, �������������������� �������,\n"
        + "����������������[10] �������, ���������������[3], ����������������;";
//debugger;
    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
            
    //Message(cnt.ModuleVars.join(', '));
            
    assertEquals('����������� ���������� ���������� �������!', 0, cnt.Methods.length);
    
    assertEquals('����������� ���������� ���������� ���������� ������!', 6, cnt.ModuleVars.length);
    assertArrayEqualsIgnoringOrder('����������� ��������� ������ ���������� ������!',
        ['�����������������', '�����������������', '��������������������', 
        '����������������', '���������������', '����������������'], cnt.ModuleVars);
}

function macrosTestAnalyseModule5_�������������������() {

    var moduleText = ""
        + "��������� ������������(�����1, �����2)\n"
        + "	����� ��������1;\n\n"	
        + "	��������1 = 42;\n\n"
        + "	������������������������ = 10;\n"	
        + "	����������������� = \"\";\n"	
        + "��������������\n\n"
        + "������� ����������(���������������)\n"
        + "	��������(�����������������);	\n"
        + "	������� ������;	\n"
        + "������������\n\n"
        + "������������(1, 2);\n"
        + "��������� = ����������();\n"

    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
    //Message(cnt.ModuleVars.join(','));
//debugger;        
    assertEquals('����������� ���������� ���������� �������!', 2, cnt.Methods.length);    
    assertEquals('����������� ���������� ���������� ���������� ������!', 0, cnt.ModuleVars.length);
}

function macrosTestAnalyseModule6_�����������������() {

    var moduleText = ""
        + "��������� ������������(�����1, �����2) "
        + "	����� ��������1; "	
        + "	��������1 = 42; "
        + "	������������������������ = 10; "	
        + "	����������������� = \"\"; "	
        + "�������������� "
        + "������� ����������(���������������) "
        + "	��������(�����������������); "
        + "	������� ������; "
        + "������������ "
        + "������������(1, 2); "
        + "��������� = ����������(); "

    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);

    assertEquals('����������� ���������� ���������� �������!', 2, cnt.Methods.length);    
    assertEquals('����������� ���������� ���������� ���������� ������!', 0, cnt.ModuleVars.length);
}

function macrosTestAnalyseModule7_�����������������() {

    var moduleText = ""
        + "����� �����������������; "
        + "����� �����������������; "
        + "����� �������������������� �������; "
        + "����� ����������������[10] �������, ���������������[3], ����������������; "
        + "��������� ������������(�����1, �����2) "
        + "	����� ��������1; "	
        + "	��������1 = 42; "
        + "	������������������������ = 10; "	
        + "	����������������� = \"\"; "	
        + "�������������� "
        + "������� ����������(���������������) "
        + "	��������(�����������������); "
        + "	������� ������;	 "
        + "������������ "
        + "������������(1, 2); "
        + "��������� = ����������();"

//debugger;        
    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
    //Message(cnt.ModuleVars.join(','));
        
    assertEquals('����������� ���������� ���������� �������!', 2, cnt.Methods.length);
    
    assertEquals('����������� ���������� ���������� ���������� ������!', 6, cnt.ModuleVars.length);
    assertArrayEqualsIgnoringOrder('����������� ��������� ������ ���������� ������!',
        ['�����������������', '�����������������', '��������������������', 
        '����������������', '���������������', '����������������'], cnt.ModuleVars);
}

function macrosTestAnalyseModule8_������������������������������() {

    var moduleText = ""
        + "����� �����������������;\n\n"
        + "����� �����������������;\n"
        + "����� �������������������� �������;\n"
        + "����� ����������������[10] �������, ���������������[3], ����������������;\n"
        + "��������� ������������(�����1, �����2)\n"
        + "	����� ��������1;\n\n"	
        + "	��������1 = 42;\n\n"
        + "	������������������������ = 10;\n"	
        + "	����������������� = \"\";\n"	
        + "��������������\n\n"
        + "������� ����������(���������������)\n"
        + "	��������(�����������������);	\n"
        + "	������� ������;	\n"
        + "������������\n\n"
        + "������������(1, 2);\n"
        + "��������� = ����������();\n"
//debugger;
    var cnt = SyntaxAnalysis.AnalyseModule(moduleText);
    //Message(cnt.ModuleVars.join(','));
            
    assertEquals('����������� ���������� ���������� ���������� ������!', 6, cnt.ModuleVars.length);
    assertArrayEqualsIgnoringOrder('����������� ��������� ������ ���������� ������!',
        ['�����������������', '�����������������', '��������������������', 
        '����������������', '���������������', '����������������'], cnt.ModuleVars);

    assertEquals('����������� ���������� ���������� �������!', 2, cnt.Methods.length);
            
    var func = cnt.getMethodByName('����������');
    assertNotUndefined("����� ���������� �� ������", func);    
    assertArrayEqualsIgnoringOrder(['���������������'], func.Params);

    assertEquals(0, func.DeclaredVars.length);    
    assertEquals(0, func.AutomaticVars.length);    
    
    var proc = cnt.getMethodByName('������������');
    assertNotNull("����� ������������ �� ������", proc);    
    assertArrayEqualsIgnoringOrder(['�����1', '�����2'], proc.Params);

    // ��������� ���������� ���������.
    assertArrayEqualsIgnoringOrder(['��������1'], proc.DeclaredVars);    
    assertArrayEqualsIgnoringOrder(['������������������������'], proc.AutomaticVars);    
    
}

//} tests of AnalyseModule

