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

        Back: { id: 'back', type: 'select', text: 'Back', opts: [], imgEnabled: 'back.gif', imgDisabled: 'back_dis.gif', tooltip: 'Back in History' },
        Forward: { id: 'forward', type: 'select', text: 'Forward', opts: [], imgEnabled: 'forward.gif', imgDisabled: 'forward_dis.gif', tooltip: 'Forward in History' },

        Preview: { id: 'preview', type: 'button', text: 'Preview', imgEnabled: 'preview.gif', imgDisabled: 'preview_dis.gif', tooltip: 'Preview' },

        SearchText: { id: 'searchText', type: 'input', value: '', width: 80, tooltip: 'Search Test' },
        Search: { id: 'search', type: 'button', imgEnabled: 'search.gif', tooltip: 'Search' },
        Execute: { id: 'execute', type: 'button', text: 'Execute', imgEnabled: 'execute.png', imgDisabled: 'execute_dis.png', tooltip: 'Execute Script' },

        Clear: { id: 'clear', type: 'button', text: 'Clear', imgEnabled: 'clear.gif', tooltip: 'Clear' },
        Refresh: { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' },
        Reload: { id: 'reload', type: 'button', text: 'Reload', imgEnabled: 'reload.png', tooltip: 'Reload Browser' },

        Open: { id: 'open', type: 'button', text: 'Open', imgEnabled: 'open.gif', imgDisabled: 'open_dis.gif', tooltip: 'Open' },
        Save: { id: 'save', type: 'button', text: 'Save', imgEnabled: 'save.gif', imgDisabled: 'save_dis.gif', tooltip: 'Save' },
        SaveAs: { id: 'saveAs', type: 'button', text: 'Save As', imgEnabled: 'save_as.gif', imgDisabled: 'save_as_dis.gif', tooltip: 'Save As' },
        Export: { id: 'export', type: 'button', text: 'Export', imgEnabled: 'downloads.gif', tooltip: 'Export' },

        Undo: { id: 'undo', type: 'button', text: 'Undo', imgEnabled: 'undo.gif', imgDisabled: 'undo_dis.gif', tooltip: 'Undo' },
        Redo: { id: 'redo', type: 'button', text: 'Redo', imgEnabled: 'redo.gif', imgDisabled: 'redo_dis.gif', tooltip: 'Redo' },

        SelectAll: { id: 'selectAll', type: 'button',text: 'Select All',  imgEnabled: 'select_all.gif', tooltip: 'Select All' },
        Cut: { id: 'cut', type: 'button', text: 'Cut', imgEnabled: 'cut.gif', imgDisabled: 'cut_dis.gif', tooltip: 'Cut' },
        Copy: { id: 'copy', type: 'button', text: 'Copy', imgEnabled: 'copy.gif', imgDisabled: 'copy_dis.gif', tooltip: 'Copy' },
        Paste: { id: 'paste', type: 'button', text: 'Paste', imgEnabled: 'paste.gif', imgDisabled: 'paste_dis.gif', tooltip: 'Paste' },

        PlayPause: { id: 'playPause', type: 'twoState', text: 'Play/Pause', imgEnabled: 'play.gif', tooltip: 'Play/Pause', pressed: false },
        WordWrap: { id: 'wordwrap', type: 'twoState', text: 'Word-Wrap', imgEnabled: 'word_wrap.gif', tooltip: 'Word Wrap', pressed: false },
        Info: { id: 'info', type: 'twoState', text: 'Info', imgEnabled: 'word_wrap.gif', tooltip: 'Info', pressed: false },
        Log: { id: 'log', type: 'twoState', text: 'Log', imgEnabled: 'word_wrap.gif', tooltip: 'Log', pressed: false },
        Warn: { id: 'warn', type: 'twoState', text: 'Warn', imgEnabled: 'word_wrap.gif', tooltip: 'Warn', pressed: false },
        Debug: { id: 'debug', type: 'twoState', text: 'Debug', imgEnabled: 'word_wrap.gif', tooltip: 'Debug', pressed: false },
        Error: { id: 'error', type: 'twoState', text: 'Error', imgEnabled: 'word_wrap.gif', tooltip: 'Error', pressed: false }
    }
};
