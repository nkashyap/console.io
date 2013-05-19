/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 21:00
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.View");
ConsoleIO.namespace("ConsoleIO.App.View.Editor");
ConsoleIO.namespace("ConsoleIO.App.View.Device");
ConsoleIO.namespace("ConsoleIO.App.View.DeviceManager");

ConsoleIO.App.View = function(){

    var appLayout = new dhtmlXLayoutObject(document.body, "3U", ConsoleIO.App.Constraint.THEMES.get('layout'));

    appLayout.cont.obj._offsetTop = 5; // top margin
    appLayout.cont.obj._offsetLeft = 5; // left margin
    appLayout.cont.obj._offsetHeight = -10; // bottom margin
    appLayout.cont.obj._offsetWidth = -10; // right margin

    appLayout.setSizes();
    appLayout.setEffect("resize", true);

    //var appMenu = appLayout.attachMenu();
    //var appToolbar = appLayout.attachToolbar();
    var appStatusBar = appLayout.attachStatusBar();
    appStatusBar.setText("Welcome to Console.IO");

    function initDeviceLayout() {
        var deviceCell = appLayout.cells("a");

        deviceCell.setText("Device List");
        appLayout.setCollapsedText("a", "Device List");

        deviceCell.setWidth(200);
        deviceCell.setHeight(250);

        var deviceTree = deviceCell.attachTree();
        deviceTree.setImagePath(ConsoleIO.App.Constraint.IMAGE_URL.get('tree'));
        deviceTree.enableHighlighting(1);
        deviceTree.enableTreeImages(1);
        deviceTree.loadJSONObject({
            id: 0,
            item: [{
                id: 1,
                text: 'Console.IO',
                item: [{
                    id: 2,
                    text: 'LG'
                }]
            }]
        });
    }

    function initEditorLayout() {
        var editorCell = appLayout.cells("b");

        editorCell.setText("Editor");
        appLayout.setCollapsedText("b", "Editor");

        var editorToolbar = editorCell.attachToolbar();
        //editorToolbar.setIconsPath("../common/imgs/");

        var newOpts = Array(Array('new_text', 'obj', 'Text Document', 'text_document.gif'), Array('new_excel', 'obj', 'Stylesheet', 'stylesheet.gif'), Array('new_db', 'obj', 'Database', 'database.gif'), Array('new_pp', 'obj', 'Presentation', 'presentation.gif'), Array('new_s1', 'sep'), Array('new_other', 'obj', 'Other', 'other.gif'));
        editorToolbar.addButtonSelect("new", 0, "New", newOpts, "new.gif", "new_dis.gif");
        editorToolbar.addSeparator("sep1", 1);
        editorToolbar.addButton("open", 2, "", "open.gif", "open_dis.gif");
        editorToolbar.addButton("save", 3, "", "save.gif", "save_dis.gif");
        editorToolbar.addButton("save_as", 4, "Save As...", "save_as.gif", "save_as_dis.gif");

        var editor = new ConsoleIO.App.Editor({
            id: "editor",
            placeholder: "Write javascript code to execute on remote client",
            mode: "javascript",
            readOnly:false
        });

        editorCell.attachObject(editor.dom.container);

    }

    function initClientLayout() {
        var clientCell = appLayout.cells("c");

        var clientTabs = clientCell.attachTabbar();
        clientTabs.setImagePath(ConsoleIO.App.Constraint.IMAGE_URL.get('tab'));
        clientTabs.enableTabCloseButton(true);

        clientTabs.addTab("lg", "LG", "100px");
        clientTabs.addTab("samsung", "Samsung", "100px");
        clientTabs.setTabActive("lg");


        var tabLayout = clientTabs.cells("lg").attachLayout("2U");
        var fileCell = tabLayout.cells("a");
        var contentCell = tabLayout.cells("b");

        fileCell.setWidth(200);
        fileCell.setText("Files");
        tabLayout.setCollapsedText("a", "Files");

        var fileTree = fileCell.attachTree();
        fileTree.setImagePath(ConsoleIO.App.Constraint.IMAGE_URL.get('tree'));
        fileTree.enableHighlighting(1);
        fileTree.enableTreeImages(1);
        fileTree.loadJSONObject({
            id: 0,
            item: [{
                id: 1,
                text: 'scripts',
                item: [{
                    id: 2,
                    text: 'javascript'
                }]
            }]
        });
        var fileToolbar = fileCell.attachToolbar();
        fileToolbar.addButton("reload", 0, "Reload", "save_as.gif");


        var contentTabs = contentCell.attachTabbar();
        contentTabs.setImagePath(ConsoleIO.App.Constraint.IMAGE_URL.get('tab'));
        contentTabs.addTab("console", "Console", "100px");
        contentTabs.addTab("source", "Source", "100px");
        contentTabs.addTab("dom", "Dom", "100px");
        contentTabs.addTab("status", "Status", "100px");
        contentTabs.setTabActive("console");


        var consoleMenu = contentTabs.cells("console").attachMenu();
        //consoleMenu.setIconsPath();
        consoleMenu.addNewSibling(null, "filter", "Filter", false);
        consoleMenu.addCheckbox('child', 'filter', 0, 'log', 'Log', true, false);
        consoleMenu.addCheckbox('child', 'filter', 1, 'info', 'Info', true, false);
        consoleMenu.addCheckbox('child', 'filter', 2, 'warn', 'Warn', true, false);
        consoleMenu.addCheckbox('child', 'filter', 3, 'debug', 'Debug', true, false);


        var sourceCell = contentTabs.cells("source");
        var sourceToolbar = sourceCell.attachToolbar();
            sourceToolbar.addButton("reload", 0, "Reload", "save_as.gif");

        var editor = new ConsoleIO.App.Editor({
            id: "src-editor",
            mode: "javascript"
        });

        sourceCell.attachObject(editor.dom.container);


        var domCell = contentTabs.cells("dom");
        var domToolbar = domCell.attachToolbar();
            domToolbar.addButton("reload", 0, "Reload", "save_as.gif");
            domToolbar.addButton("preview", 1, "Preview", "save_as.gif");

        var domEditor = new ConsoleIO.App.Editor({
            id: "dom-preview"
        });

        domCell.attachObject(domEditor.dom.container);

        var statusCell = contentTabs.cells("status");
        var statusToolbar = statusCell.attachToolbar();
        statusToolbar.addButton("reload", 0, "Reload", "save_as.gif");

    }

    initEditorLayout();
    initClientLayout();
};


ConsoleIO.App.View.DeviceManager = function DeviceManager(target){
    target.setText("Device List");
    target.setWidth(200);
    target.setHeight(250);

    var deviceTree = target.attachTree();
    deviceTree.setImagePath(ConsoleIO.App.Constraint.IMAGE_URL.get('tree'));
    deviceTree.enableHighlighting(1);
    deviceTree.enableTreeImages(1);
    deviceTree.loadJSONObject({
        id: 0,
        item: [{
            id: 1,
            text: 'Console.IO',
            item: [{
                id: 2,
                text: 'LG'
            }]
        }]
    });
};