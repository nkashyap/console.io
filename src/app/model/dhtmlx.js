/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.Model.DHTMLX");

ConsoleIO.Model.DHTMLX = {
    ToolBarItem: {
        Separator: { type: 'separator' },

        PageSize: { id: 'pagesize', type: 'select', text: 'PageSize', imgEnabled: 'pagesize.png', tooltip: 'Page Size', width: 90, opts: 'pagesizes' },

        Source: { id: 'source', type: 'twoState', text: 'Source', imgEnabled: 'source.png', imgDisabled: 'source_dis.png', tooltip: 'Source', pressed: true },
        Preview: { id: 'preview', type: 'twoState', text: 'Preview', imgEnabled: 'preview.png', imgDisabled: 'preview_dis.png', tooltip: 'Preview', pressed: false },

        ScreenShot: { id: 'screenShot', type: 'button', text: 'Capture', imgEnabled: 'screenshot.png', imgDisabled: 'screenshot_dis.png', tooltip: 'ScreenShot' },

        TriggerLabel: { id: 'triggerLabel', type: 'text', text: 'Trigger Interval' },
        TriggerInterval: { id: 'triggerInterval', type: 'input', value: '', width: 100, tooltip: 'Trigger interval' },
        KeyPress: { id: 'keyPress', type: 'twoState', text: 'KeyPress', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'KeyPress' },
        KeyDown: { id: 'keyDown', type: 'twoState', text: 'KeyDown', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'KeyDown' },
        KeyUp: { id: 'keyUp', type: 'twoState', text: 'KeyUp', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'KeyUp' },
        MouseMove: { id: 'mouseMove', type: 'twoState', text: 'MouseMove', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'MouseMove' },
        MouseOver: { id: 'mouseOver', type: 'twoState', text: 'MouseOver', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'MouseOver' },
        MouseOut: { id: 'mouseOut', type: 'twoState', text: 'MouseOut', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'MouseOut' },
        MouseEnter: { id: 'mouseEnter', type: 'twoState', text: 'MouseEnter', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'MouseEnter' },
        MouseLeave: { id: 'mouseLeave', type: 'twoState', text: 'MouseLeave', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'MouseLeave' },
        Click: { id: 'click', type: 'twoState', text: 'Click', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'Click' },
        DoubleClick: { id: 'doubleClick', type: 'twoState', text: 'DoubleClick', imgEnabled: 'connect.png', imgDisabled: 'connect_dis.png', tooltip: 'DoubleClick' },

        DeviceNameLabel: { id: 'deviceNameLabel', type: 'text', text: 'Device Name:', tooltip: 'Device Name' },
        DeviceNameText: { id: 'deviceNameText', type: 'input', value: '', width: 120, tooltip: 'Enter Device Name' },
        DeviceNameSet: { id: 'deviceNameSet', type: 'button', imgEnabled: 'go.png', tooltip: 'Set Device Name' },

        SearchText: { id: 'searchText', type: 'input', value: '', width: 100, tooltip: 'Search Text' },
        Search: { id: 'search', type: 'button', imgEnabled: 'search.png', imgDisabled: 'search_dis.png', tooltip: 'Search' },
        Execute: { id: 'execute', type: 'button', text: 'Execute', imgEnabled: 'execute.png', imgDisabled: 'execute_dis.png', tooltip: 'Execute (Ctrl+Enter)' },

        Clear: { id: 'clear', type: 'button', text: 'Clear', imgEnabled: 'clear.png', tooltip: 'Clear' },
        Refresh: { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.png', tooltip: 'Refresh' },
        Reload: { id: 'reload', type: 'button', text: 'Reload', imgEnabled: 'reload.png', tooltip: 'Reload Browser' },

        Open: { id: 'open', type: 'select', text: 'Open', imgEnabled: 'open.png', imgDisabled: 'open_dis.png', tooltip: 'Open', opts: [] },
        Save: { id: 'save', type: 'select', text: 'Save', imgEnabled: 'save.png', imgDisabled: 'save_dis.png', tooltip: 'Save', disabled: true, opts: [
            ['saveAs', 'obj', 'Save As', 'save_as.png']
        ]},
        Export: { id: 'export', type: 'button', text: 'Export', imgEnabled: 'downloads.png', tooltip: 'Export' },

        Undo: { id: 'undo', type: 'button', text: 'Undo', imgEnabled: 'undo.png', imgDisabled: 'undo_dis.png', tooltip: 'Undo', disabled: true },
        Redo: { id: 'redo', type: 'button', text: 'Redo', imgEnabled: 'redo.png', imgDisabled: 'redo_dis.png', tooltip: 'Redo', disabled: true },

        SelectAll: { id: 'selectAll', type: 'button', text: 'Select All', imgEnabled: 'select_all.png', imgDisabled: 'select_all_dis.png', tooltip: 'Select All' },
        Cut: { id: 'cut', type: 'button', text: 'Cut', imgEnabled: 'cut.png', imgDisabled: 'cut_dis.png', tooltip: 'Cut' },
        Copy: { id: 'copy', type: 'button', text: 'Copy', imgEnabled: 'copy.png', imgDisabled: 'copy_dis.png', tooltip: 'Copy' },
        Paste: { id: 'paste', type: 'button', text: 'Paste', imgEnabled: 'paste.png', imgDisabled: 'paste_dis.png', tooltip: 'Paste' },


        Profiler: { id: 'profiler', type: 'twoState', text: 'Start Profiling', imgEnabled: 'rec.png', imgDisabled: 'rec_dis.png', tooltip: 'Start CPU Profiling', pressed: false },
        ProfileView: { id: 'displaySelector', type: 'select', text: 'Tree (Top Down)', width: 110, hidden: true, disabled: true, opts: [
            ['heavy', 'obj', 'Heavy (Bottom Up)'],
            ['tree', 'obj', 'Tree (Top Down)']
        ] },
        TimeOrPercent: { id: 'timePercent', type: 'twoState', imgEnabled: 'percent.png', imgDisabled: 'percent.png', tooltip: 'Show total and self time in percentage', hidden: true, disabled: true, pressed: false },
        FocusFn: { id: 'focusFn', type: 'button', imgEnabled: 'zoom.png', imgDisabled: 'zoom_dis.png', tooltip: 'Focus selected function', hidden: true, disabled: true },
        RestoreFn: { id: 'restoreFn', type: 'button', imgEnabled: 'undo.png', imgDisabled: 'undo_dis.png', tooltip: 'Restore all functions', hidden: true, disabled: true },
        ExcludeFn: { id: 'excludeFn', type: 'button', imgEnabled: 'clear.png', imgDisabled: 'clear_dis.png', tooltip: 'Exclude selected function', hidden: true, disabled: true },


        Web: { id: 'web', type: 'twoState', text: 'Web Console', imgEnabled: 'console.png', tooltip: 'Web Console', pressed: false },
        PlayPause: { id: 'playPause', type: 'twoState', text: 'Pause', imgEnabled: 'pause.png', tooltip: 'Pause logs', pressed: false },
        WordWrap: { id: 'wordwrap', type: 'twoState', text: 'Word-Wrap', imgEnabled: 'word_wrap.png', imgDisabled: 'word_wrap_dis.png', tooltip: 'Word Wrap', pressed: false },
        Beautify: { id: 'beautify', type: 'twoState', text: 'Beautify', imgEnabled: 'beautify.png', imgDisabled: 'beautify_dis.png', tooltip: 'Beautify', pressed: false },


        FilterLabel: { id: 'filterLabel', type: 'text', text: 'Filters:', tooltip: 'Filter Console Logs' },
        Info: { id: 'filter-info', type: 'twoState', text: 'Info', imgEnabled: 'info.png', tooltip: 'Info', pressed: false },
        Log: { id: 'filter-log', type: 'twoState', text: 'Log', imgEnabled: 'log.png', tooltip: 'Log', pressed: false },
        Warn: { id: 'filter-warn', type: 'twoState', text: 'Warn', imgEnabled: 'warn.png', tooltip: 'Warn', pressed: false },
        Debug: { id: 'filter-debug', type: 'twoState', text: 'Debug', imgEnabled: 'debug.png', tooltip: 'Debug', pressed: false },
        Trace: { id: 'filter-trace', type: 'twoState', text: 'Trace', imgEnabled: 'trace.png', tooltip: 'Trace', pressed: false },
        Error: { id: 'filter-error', type: 'twoState', text: 'Error', imgEnabled: 'error.png', tooltip: 'Error', pressed: false }
    }
};
