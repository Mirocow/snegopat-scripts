$engine JScript
$uname autosave
$dname ��������������

// ��������� ������ � ������������ ���������
SelfScript.addNamedItem("stdcommands", addins.byUniqueName('stdcommands').object)

// ����������� ���������
var pflAutoSaveEnable = "Autosave/Enable"		// ������� ���� � ��������
var pflAutoSaveInterval = "Autosave/Interval"
// ��� ������ ���� ������� ����� � ����������, ������ �� ��������� ��������, � �����
// � ����� ��������� �� ���������, ����� setValue �� ����� ��������.
// ����� ��������� � ��������� ���������.
profileRoot.createValue(pflAutoSaveEnable, false, pflSnegopat)
profileRoot.createValue(pflAutoSaveInterval, 60, pflSnegopat)
// ������ ��������� ���������� �������� �� ��������
var enabled = profileRoot.getValue(pflAutoSaveEnable)
var interval = profileRoot.getValue(pflAutoSaveInterval)
var lastSaveTime = new Date().getTime() / 1000

// ��� ������ ����� ������ �� ����� ������� ���������
function Designer::onIdle()
{
	if(!enabled)
		return
	var dt = new Date().getTime() / 1000
	if(dt - lastSaveTime > interval)
	{
		// �������� ������������
		stdcommands.Config.Save.send()
		// �������� ������� ����
		stdcommands.Frame.FileSave.send()
		lastSaveTime = dt
	}
}

// ������ ��� ������ ���� ���������
function macros�����������������������()
{
	var pathToForm = SelfScript.fullPath.replace(/js$/, 'ssf')
	// ��������� ������� ����� �������� � ������ �������
	form = loadScriptForm(pathToForm, SelfScript.self)
	form.�������� = enabled
	form.�������� = interval
	form.���������������()
	form = null
}

// ����������� ������� ������ � �����
function ���������(�������)
{
	// ��������� �������� �� ����� � ���� ��� ����������, �������� ��
	if(form.�������� != enabled)
	{
		enabled = form.��������
		profileRoot.setValue(pflAutoSaveEnable, enabled)
	}
	if(form.�������� != interval)
	{
		interval = form.��������
		profileRoot.setValue(pflAutoSaveInterval, interval)
	}
	form.�������()
}

function �������������(�������)
{
	form.�������()
}
