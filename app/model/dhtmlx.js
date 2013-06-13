/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 23/05/13
 * Time: 18:21
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.Model.DHTMLX");

ConsoleIO.Model.DHTMLX = {
    ToolBarItem: {
        Separator: { type: 'separator' },

        //Back: { id: 'back', type: 'select', text: 'Back', opts: [], imgEnabled: 'back.gif', imgDisabled: 'back_dis.gif', tooltip: 'Back in History' },
        //Forward: { id: 'forward', type: 'select', text: 'Forward', opts: [], imgEnabled: 'forward.gif', imgDisabled: 'forward_dis.gif', tooltip: 'Forward in History' },

        PageSize: { id: 'pagesize', type: 'select', text: 'PageSize', imgEnabled: 'pagesize.gif', tooltip: 'Page Size', width: 90, opts: 'pagesizes' },
        Preview: { id: 'preview', type: 'button', text: 'Preview', imgEnabled: 'preview.gif', imgDisabled: 'preview_dis.gif', tooltip: 'Preview' },
        ScreenShot: { id: 'screenShot', type: 'button', text: 'ScreenShot', imgEnabled: 'screenshot.png', imgDisabled: 'screenshot_dis.png', tooltip: 'ScreenShot' },

        DeviceNameLabel: { id: 'deviceNameLabel', type: 'text', text: 'Device Name:', tooltip: 'Device Name' },
        DeviceNameText: { id: 'deviceNameText', type: 'input', value: '', width: 120, tooltip: 'Enter Device Name' },
        DeviceNameSet: { id: 'deviceNameSet', type: 'button', imgEnabled: 'go.png', tooltip: 'Set Device Name' },

        SearchText: { id: 'searchText', type: 'input', value: '', width: 100, tooltip: 'Search Text' },
        Search: { id: 'search', type: 'button', imgEnabled: 'search.gif', imgDisabled: 'search_dis.gif', tooltip: 'Search' },
        Execute: { id: 'execute', type: 'button', text: 'Execute', imgEnabled: 'execute.png', imgDisabled: 'execute_dis.png', tooltip: 'Execute Script' },

        Clear: { id: 'clear', type: 'button', text: 'Clear', imgEnabled: 'clear.gif', tooltip: 'Clear' },
        Refresh: { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' },
        Reload: { id: 'reload', type: 'button', text: 'Reload', imgEnabled: 'reload.png', tooltip: 'Reload Browser' },

        Open: { id: 'open', type: 'select', text: 'Open', imgEnabled: 'open.gif', imgDisabled: 'open_dis.gif', tooltip: 'Open', opts: [] },
        Save: { id: 'save', type: 'select', text: 'Save', imgEnabled: 'save.gif', imgDisabled: 'save_dis.gif', tooltip: 'Save', disabled: true, opts: [
            ['saveAs', 'obj', 'Save As', 'save_as.gif']
        ]},
        Export: { id: 'export', type: 'button', text: 'Export', imgEnabled: 'downloads.gif', tooltip: 'Export' },

        Undo: { id: 'undo', type: 'button', text: 'Undo', imgEnabled: 'undo.gif', imgDisabled: 'undo_dis.gif', tooltip: 'Undo', disabled: true },
        Redo: { id: 'redo', type: 'button', text: 'Redo', imgEnabled: 'redo.gif', imgDisabled: 'redo_dis.gif', tooltip: 'Redo', disabled: true },

        SelectAll: { id: 'selectAll', type: 'button', text: 'Select All', imgEnabled: 'select_all.gif', tooltip: 'Select All' },
        Cut: { id: 'cut', type: 'button', text: 'Cut', imgEnabled: 'cut.gif', imgDisabled: 'cut_dis.gif', tooltip: 'Cut' },
        Copy: { id: 'copy', type: 'button', text: 'Copy', imgEnabled: 'copy.gif', imgDisabled: 'copy_dis.gif', tooltip: 'Copy' },
        Paste: { id: 'paste', type: 'button', text: 'Paste', imgEnabled: 'paste.gif', imgDisabled: 'paste_dis.gif', tooltip: 'Paste' },

        WebIO: { id: 'webIO', type: 'twoState', text: 'WebIO', imgEnabled: 'console.gif', tooltip: 'WebIO plugin', pressed: false },
        PlayPause: { id: 'playPause', type: 'twoState', text: 'Pause', imgEnabled: 'pause.png', tooltip: 'Pause logs', pressed: false },
        WordWrap: { id: 'wordwrap', type: 'twoState', text: 'Word-Wrap', imgEnabled: 'word_wrap.gif', tooltip: 'Word Wrap', pressed: false },

        FilterLabel: { id: 'filterLabel', type: 'text', text: 'Filters:', tooltip: 'Filter Console Logs' },
        Info: { id: 'filter-info', type: 'twoState', text: 'Info', imgEnabled: 'info.gif', tooltip: 'Info', pressed: false },
        Log: { id: 'filter-log', type: 'twoState', text: 'Log', imgEnabled: 'log.png', tooltip: 'Log', pressed: false },
        Warn: { id: 'filter-warn', type: 'twoState', text: 'Warn', imgEnabled: 'warn.png', tooltip: 'Warn', pressed: false },
        Debug: { id: 'filter-debug', type: 'twoState', text: 'Debug', imgEnabled: 'debug.gif', tooltip: 'Debug', pressed: false },
        Error: { id: 'filter-error', type: 'twoState', text: 'Error', imgEnabled: 'error.gif', tooltip: 'Error', pressed: false }
    }
};
