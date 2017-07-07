var notebook;

define([
  'base/js/namespace',
  'base/js/dialog'
], function(jupyter, dialog) {

	var keyboard_manager = jupyter.keyboard_manager;
	notebook = jupyter.notebook;

  function preview_tool() {

    var $feedback_modal = dialog.modal({
      notebook: notebook,
      keyboard_manager: keyboard_manager,
      title: 'Preparing tool preview...',
      body: 'Please be patient.'
    });

		var code_cell = notebook.container.find('.code_cell').first().data('cell');
		if (code_cell === undefined || !/crosscompute/i.test(code_cell.get_text())) {
      rewrite_modal($feedback_modal, 'Tool preview cancelled', '<p>This notebook does not appear to be a CrossCompute Tool.</p><p><a href="https://crosscompute.com/create#create-tools" target="_blank">Please make sure the first code cell contains the word CrossCompute</a>.</p>');
      return;
    }

    notebook.save_notebook();
    notebook.events.one('notebook_saved.Notebook', function () {
      $.ajax({
        url: notebook.base_url + 'extensions/crosscompute/preview.json',
        data: {
          'notebook_path': notebook.notebook_path
        },
        success: function(d) {
          rewrite_modal($feedback_modal, 'Tool preview succeeded', '<p><a href="X" target="_blank">Click here to access your tool preview</a>.</p><p>Note that stopping the notebook server will also stop the tool preview server.</p>'.replace(/X/g, d.tool_url));
        },
        error: function(jqXHR) {
          var d = jqXHR.responseJSON;
          var x = d.text ? '<pre>' + d.text + '</pre>' : 'Unable to connect to tool server';
          rewrite_modal($feedback_modal, 'Tool preview failed', x);
        }
      });
    });
  }

  function rewrite_modal($modal, title, body) {
      $modal.find('.modal-title').text(title);
      $modal.find('.modal-body').html(body);
  }

  function load_ipython_extension() {
    var actions = keyboard_manager.actions;
    var shortcuts = keyboard_manager.command_shortcuts;

    var preview_tool_action_name = actions.register({
      'icon': 'fa-paper-plane-o',
      'help': 'preview tool',
      'help_index': 'crosscompute-preview',
      'handler': preview_tool
    }, 'preview-tool', 'crosscompute');
    shortcuts.add_shortcut('Shift-C,Shift-P', preview_tool_action_name);

    jupyter.toolbar.add_buttons_group([
      preview_tool_action_name,
    ]);

    var $toolbar = $('#maintoolbar-container');
    $toolbar.find('button[data-jupyter-action="' + preview_tool_action_name + '"]').css('background-color', '#5cb85c');
  }

  return {
    load_ipython_extension: load_ipython_extension
  };

});
