$engine JScript
$uname CfgStore
$dname ���������
$addin global
$addin stdcommands
$addin stdlib

stdlib.require('TextWindow.js', SelfScript);

global.connectGlobals(SelfScript);

function getPredefinedHotkeys(predef){
    predef.setVersion(1);
    predef.add("��������� ������ � ���������", "Ctrl + Alt + T");
}

isEventConnected = false

SelfScript.self['macros��������� ������ � ���������'] = function() {

        // var w = GetTextWindow();
        // if (!w) return false;
        
        // view = w.GetView();
    view = windows.getActiveView();
    if (!view) return false;
    
    res1 = view.mdObj.activateInTree();
    
    res2 = events.connect(windows, "onDoModal", SelfScript.self, "hookCaptureCfgStoreWindow")
    isEventConnected = true

    res = stdcommands.CfgStore.CaptureIntoCfgStore.send() // true ���� �������

    if(isEventConnected)
        events.disconnect(windows, "onDoModal", SelfScript.self, "hookCaptureCfgStoreWindow")
    return true;
}

function hookCaptureCfgStoreWindow(dlgInfo)
{
   if(dlgInfo.stage == openModalWnd)
   {
        dlgInfo.form.getControl("GetRecursive").value = false;
    
        events.disconnect(windows, "onDoModal", SelfScript.self, "hookCaptureCfgStoreWindow")
        isEventConnected = false
      
        new ActiveXObject("WScript.Shell").SendKeys("^{ENTER}")
   }
}