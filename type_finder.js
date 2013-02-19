﻿$engine JScript
$uname type_finder
$dname Быстрый поиск типа
$addin global
$addin stdlib
$addin stdcommands
$addin hotkeys hk

// (c) Александр Орефков
// Скрипт, облегчающий работу в диалоге выбора типа

global.connectGlobals(SelfScript)
wapi = stdlib.require("winapi.js");
stdlib.require("TextChangesWatcher.js", SelfScript);

events.connect(windows, "onDoModal", SelfScript.self)

var form, typeTreeCtrl, multyTypeCtrl, quickSel, tc, initName, hkID, v8Form

function initForm()
{
    // Загрузим и настроим форму
    form = loadScriptForm(SelfScript.fullPath.replace(/js$/, 'ssf'), SelfScript.self)
    form.КлючСохраненияПоложенияОкна = SelfScript.uniqueName
    form.Types.Columns.Add("data")
    form.Types.Columns.Add("picture")
    form.Controls.Cmds.Кнопки.ShowStd.СочетаниеКлавиш = stdlib.v8hotkey(13, 4)
    form.Controls.Cmds.Кнопки.Ok.СочетаниеКлавиш = stdlib.v8hotkey(13, 0)
    tc = new TextChangesWatcher(form.ЭлементыФормы.Pattern, 3, updateList)
    initName = ''
    var r = typeTreeCtrl.extInterface.currentRow
    if(r)
    {
        for(;;)
        {
            initName = r.getCellAppearance(0).text + initName
            if(r.parent)
            {
                initName = '.' + initName
                r = r.parent
            }
            else
                break
        }        
    }
}

function walkTypeTree(f)
{
    var grid = typeTreeCtrl.extInterface
    function forAllTypes(parent, prefix, f)
    {
        var row = parent.firstChild
        while(row)
        {
            var ca = row.getCellAppearance(0)
            var fullName = prefix + ca.text
            if(row.firstChild)
                forAllTypes(row, fullName + ".", f)
            else if(f(fullName))
            {
                var r = form.Types.Add()
                r.Type = fullName
                r.picture = ca.picture
                r.data = row
                if(fullName == initName)
                    form.Controls.Types.CurrentRow = r
            }
            row = row.next
        }
    }
    forAllTypes(grid.dataSource.root, '', f)
}

function updateList(pattern)
{
    form.Types.Clear()
    pattern = pattern.replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '')
    if(!pattern.length)
        walkTypeTree(function(){return true})
    else
    {
        var filters = pattern.toLowerCase().split(' ')
        walkTypeTree(function(text) {
            text = text.toLowerCase();
            for(var k in filters)
            {
                if(text.indexOf(filters[k]) == -1)
                    return false
            }
            return true
        })
    }
    if(!form.Controls.Types.CurrentRow && form.Types.Count())
        form.Controls.Types.CurrentRow = form.Types.Get(0)
}

function ПриОткрытии()
{
    tc.start()
    updateList('')
}

function ПриЗакрытии()
{
    tc.stop()
}

function CmdsOk(Кнопка)
{
    var cr = form.Controls.Types.ТекущаяСтрока
    if(cr)
        form.Закрыть({result: true, selectedRow: cr.data})
}

function CmdsShowStd(Кнопка)
{
    form.Закрыть({result:false})
}

function PatternРегулирование(Элемент, Направление, СтандартнаяОбработка)
{
    var tab = form.Types, tp = form.Controls.Types
    if(!tp.ТекущаяСтрока)
        return
    var curRow = tab.Индекс(tp.ТекущаяСтрока), newRow = curRow
    
    if(-1 == Направление.val)
    {
        if(curRow != tab.Количество() - 1)
            newRow++
    }
    else
    {
        if(curRow > 0)
            newRow--
    }
    if(newRow != curRow)
        tp.ТекущаяСтрока = tab.Получить(newRow)
    СтандартнаяОбработка.val = false
}

function TypesВыбор(Элемент, ВыбраннаяСтрока, Колонка, СтандартнаяОбработка)
{
    CmdsOk()
}

function TypesПриВыводеСтроки(Элемент, ОформлениеСтроки, ДанныеСтроки)
{
    if(ДанныеСтроки.val.picture)
        ОформлениеСтроки.val.Cells.Type.SetPicture(ДанныеСтроки.val.picture)
}

function PatternНачалоВыбора(Элемент, СтандартнаяОбработка)
{
}


// Здесь мы будем отлавливать открытие и закрытие модального диалога
// редактирования типа.
function onDoModal(dlgInfo)
{
    /*
    if(dlgInfo.stage == openModalWnd && dlgInfo.form)
    {
        dlgInfo.form.trapDialogEvents = true
        for(var k = 0; k < dlgInfo.form.controlsCount; k++)
            Message(dlgInfo.form.getControl(k).name)
    }
    */
    
    // Привязываться к заголовку диалога не очень хорошо, он может быть другим
    // в другой локализации. А такой состав контролов говорит о том, что открылся
    // диалог выбора типа.
    try{
        var tt = dlgInfo.form.getControl('TypeTree')
        var mt = dlgInfo.form.getControl('CheckDomainEnable')
    }catch(e){ return }
    switch(dlgInfo.stage){
    case afterInitial:
        typeTreeCtrl = tt
        multyTypeCtrl = mt
        initForm()
        v8Form = dlgInfo.form;
        if(!multyTypeCtrl.value)    // Если не составной тип, сразу будем выбирать
        {
            quickSel = selectType()
            if(!quickSel)    // Нажали отмену
            {
                dlgInfo.cancel = true;
                dlgInfo.result = 0;
            }
            else
            {
                if(quickSel.result) // Нажали Ok, закрываем штатный диалог
                {
                    // Посылаем форме нажатие кнопки OK
                    v8Form.sendEvent(v8Form.getControl('OK').id, 0)
                }
                else
                {
                    // Нажали "Показать стандартный" - добавим горячих клавиш
                    hkID = [hotkeys.addTemp(hk.stringTovkcode('Ctrl+F'), SelfScript.uniqueName, "НайтиТип"),
                            hotkeys.addTemp(hk.stringTovkcode('Ctrl+K'), SelfScript.uniqueName, "ПереключитьСоставныеТипы")]
                }
            }
        }
        break
    case openModalWnd:
        if(quickSel && !quickSel.result)    // Нажали "Показать стандартный"
            wapi.SetFocus(typeTreeCtrl.hwnd)
        break;
    case afterDoModal:
        // Тут диалог уже закрывается, обнулим данные
        typeTreeCtrl = null
        multyTypeCtrl = null
        quickSel = null
        form = null
        v8Form.detach()
        v8Form = null
        if(hkID)
        {
            hotkeys.removeTemp(hkID[0])
            hotkeys.removeTemp(hkID[1])
            hkID = 0
        }
        break
    }
}

// Макрос можно вызывать, если нажали "Показать стандартный", вешается на Ctrl+K
function macrosПереключитьСоставныеТипы()
{
    if(!multyTypeCtrl)
        return false
    // Сменим значение
    multyTypeCtrl.value = !multyTypeCtrl.value
    // Уведомим форму
    v8Form.sendEvent(multyTypeCtrl.id, 0)
    v8Form.sendEvent(multyTypeCtrl.id, 1)
}

// Макрос можно вызывать, если нажали "Показать стандартный", вешается на Ctrl+F
function macrosНайтиТип()
{
    if(!typeTreeCtrl)
        return false
    var res = selectType()
    if(res && res.result)
        wapi.SetFocus(typeTreeCtrl.hwnd)
}

function selectType()
{
    var res = form.ОткрытьМодально();
    if(res && res.result)
    {
        var grid = typeTreeCtrl.extInterface, row = res.selectedRow
        // Активируем строку
        grid.currentRow = row
        // Ставим пометку
        grid.checkCell(row, 0, 1)
        // Сообщим форме о смене метки
        v8Form.sendEvent(typeTreeCtrl.id, 17, 1)
    }
    return res
}
