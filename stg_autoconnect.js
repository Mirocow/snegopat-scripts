﻿$engine JScript
$uname stg_autoconnect
$dname Авто-подключение к хранилищу
$addin stdcommands
$addin global

global.connectGlobals(SelfScript)
// (с) Александр Орефков orefkov at gmail.com
// Это небольшой скрипт для подстановки пути/имени/пароля в диалоге подключения к хранилищу.
// Данные сохраняется в профайле база/пользователь.
// При первом подключении к хранилищу скрипт предлагает запомнить введенные данные,
// и в дальнейшем сразу подставляет их при подключении к хранилищу.
// Если вам надо ввести другие данне, выполните макрос "СброситьСохраненныеДанные"

// Зададим пути хранения настроек
var pflPath = "StgAutoConnect/"
var pflData = pflPath + "data"                      // Данные
var pflShowMessage = pflPath + "ShowMessage"        // Показывать сообщение при подстановке
var pflCurrentBasePath = pflPath + "CurrentBasePath"; //Храними путь к базе данных, если поменялась, тогда будем спрашивать точно надо подключится.
var prevConnectSuccessed = true

// Настройку отображения сообщений будем хранить едино для всех баз, в профиле Снегопата
profileRoot.createValue(pflShowMessage, true, pflSnegopat)
// Подцепляемся к событию показа модальных окон. Если со временем появится событие подключения к хранилищу,
// то надо будет делать это в том событии, и после отключаться от перехвата модальных окон.
events.connect(windows, "onDoModal", SelfScript.self)

function cnnString()
{
    КаталогИБ = НСтр(СтрокаСоединенияИнформационнойБазы(), "File")
    if(КаталогИБ)
        return КаталогИБ
    else
        return НСтр(СтрокаСоединенияИнформационнойБазы(), "Srvr") + ":" + НСтр(СтрокаСоединенияИнформационнойБазы(), "Ref")
}

var count = 0;

// Обработчик показа модальных окон.
function onDoModal(dlgInfo)
{
    if(dlgInfo.caption == "Соединение с хранилищем конфигурации")
    {
    	count++;

    	if (count > 16) {
		prevConnectSuccessed = true;
                events.connect(Designer, "onIdle", SelfScript.self);
                count = 0;
        }
                      
        if(dlgInfo.stage == beforeDoModal)
        {
            var data = profileRoot.getValue(pflData)
            if(data)
            {
                if(!prevConnectSuccessed)
                {
                    if(MessageBox("Авто-соединение с хранилищем было неудачным. Сбросить сохраненные данные?", mbYesNo | mbDefButton1 | mbIconQuestion, "Снегопат") == mbaYes)
                        profileRoot.deleteValue(pflData)
                }
                else
                {
                    var currentBasePath = profileRoot.getValue(pflCurrentBasePath);
                    if (!currentBasePath)
                        currentBasePath = cnnString();
                    
                    if (currentBasePath!=cnnString()){
                        var questionStirng = " Для базы сохранена другая строка подключения. \n";
                        questionStirng += "Текущий путь:"+cnnString()+"\n";
                        questionStirng += "Сохраненный путь:"+currentBasePath+" \n";
                        questionStirng += "\t ВНИМАНИЕ ВОПРОС \n"+"Продолжить автоподключение?";
                        if(MessageBox( questionStirng, mbYesNo | mbDefButton1 | mbIconQuestion, "Авто-соединение к хранилищу!") == mbaNo)
                            return;
                    }
                    // Если есть сохраненные данные, то вводим их
                    dlgInfo.form.getControl("UserName").value = data.login
                    dlgInfo.form.getControl("UserPassword").value = data.password
                    dlgInfo.form.getControl("DepotPath").value = data.path
                    dlgInfo.cancel = true   // Отменяем показ диалога
                    dlgInfo.result = 1      // Как будто в нем нажали Ок
                    if(profileRoot.getValue(pflShowMessage))    // Информируем пользователя, если он хочет
                        Message("Авто-подключение к хранилищу '" + data.path + "' пользователем '" + data.login + "'")
                    // Взведем процедуру определения успешности соединения с хранилищем
                    prevConnectSuccessed = false
                    events.connect(Designer, "onIdle", SelfScript.self)
                }
            }
        }
        else if(dlgInfo.stage == afterDoModal && dlgInfo.result == 1)
        {
            // Предложим сохранить введенные данные
            if(MessageBox("Подставлять введенные значения автоматически при последующих подключениях?",
                mbYesNo | mbDefButton1 | mbIconQuestion) == mbaYes)
            {
                // Сохраним их
                var data = v8New("Структура", "login,password,path",
                    dlgInfo.form.getControl("UserName").value,
                    dlgInfo.form.getControl("UserPassword").value,
                    dlgInfo.form.getControl("DepotPath").value)
                var currentBasePath = cnnString();
                profileRoot.createValue(pflData, false, pflBaseUser)    // Храним отдельно для базы/пользователя
                profileRoot.createValue(pflCurrentBasePath, false, pflBaseUser);
                profileRoot.setValue(pflData, data)
                profileRoot.setValue(pflCurrentBasePath, currentBasePath)
            }
        }
        
    }
    else if(dlgInfo.stage == openModalWnd && (dlgInfo.caption == "Захват объектов в хранилище конфигурации" ||
        dlgInfo.caption == "Помещение объектов в хранилище конфигурации"))
    {
        //for(var i = 0; i < dlgInfo.form.controlsCount; i++)
        //    Message(dlgInfo.form.getControl(i).name)
        dlgInfo.form.getControl("GetRecursive").value = true
    }
}

function onIdle()
{
    prevConnectSuccessed = true
    events.disconnect(Designer, "onIdle", SelfScript.self)
}

SelfScript.self["macrosСбросить cохраненные данные"] = function()
{
    profileRoot.deleteValue(pflData);
    profileRoot.deleteValue(pflCurrentBasePath);

}

SelfScript.self["macrosПоказывать сообщение при подключении"] = function()
{
    profileRoot.setValue(pflShowMessage, true)
}

SelfScript.self["macrosНе показывать сообщение при подключении"] = function()
{
    profileRoot.setValue(pflShowMessage, false)
}
