var notebook;

define([
  'base/js/namespace',
  'base/js/dialog'
], function(jupyter, dialog) {

  var $modal;
  var $toolbar = $('#maintoolbar-container');
	var keyboard_manager = jupyter.keyboard_manager;
	notebook = jupyter.notebook;

  function preview_tool() {
    process_notebook('preview', 'preview');
  }

  function deploy_tool() {
    process_notebook('deploy', 'deployment');
  }

  function process_notebook(verb, noun) {
    function render_text(x) {
      return x.replace(/X/g, noun);
    }

		var code_cell = notebook.container.find('.code_cell').first().data('cell');
		if (code_cell === undefined || !/crosscompute/i.test(code_cell.get_text())) {
      update_modal(render_text('Tool X cancelled'), '<p>This notebook does not appear to be a CrossCompute Tool.</p><p><a href="https://crosscompute.com/create#create-tools" target="_blank">Please make sure the first code cell contains the word CrossCompute</a>.</p>');
      return;
    }

    update_modal(render_text('Preparing tool X...'), 'Please be patient.');
    notebook.events.one('notebook_saved.Notebook', function() {
      $.ajax({
        method: 'post',
        url: notebook.base_url + 'extensions/crosscompute/X.json'.replace('X', verb),
        data: {
          '_xsrf': get_cookie('_xsrf'),
          'notebook_path': notebook.notebook_path
        }
      }).fail(function(jqXHR) {
        var title = render_text('Tool X failed'), body = 'Unable to reach server.';
        switch(jqXHR.status) {
          case 400:
            var d = jqXHR.responseJSON;
            if (d.text) {
              body = '<pre>' + d.text + '</pre>';
            }
            break;
          case 401:
            update_modal('Server token required', '<textarea class="form-control"></textarea>');
            var $textarea = $modal.find('textarea');
            $modal.one('hidden.bs.modal', function() {
              var server_token = $.trim($textarea.val());
              if (!server_token.length) return;
              update_configuration('server_token', server_token);
            });
            return;
          case 403:
            body = 'Anonymous sessions cannot X tools. <a href="https://crosscompute.com" target="_blank">Please sign in and start an authenticated session</a> to X this tool.'.replace('X', verb);
            break;
        }
        update_modal(title, body);
      }).done(function(d) {
        update_modal(render_text('Tool X succeeded'), '<p><a href="X" target="_blank">Click here to access your tool</a>.</p>'.replace(/X/g, d.tool_url));
      });
    });
    notebook.save_notebook();
    setTimeout(function() {
      if ($('.modal').length > 1) {
        $modal.modal('hide');
      }
    }, 500);
  }

  function update_configuration(variable_name, variable_value) {
    $.ajax({
      method: 'post',
      url: notebook.base_url + 'extensions/crosscompute/configure.json',
      data: {
        '_xsrf': get_cookie('_xsrf'),
        'variable_name': variable_name,
        'variable_value': variable_value,
      },
      success: function(d) {
        update_modal('Configuration update succeeded', 'Please retry your request.');
      },
      error: function(jqXHR) {
        update_modal('Configuration update failed', 'Could not update configuration at this time.');
      }
    });
  }

  function get_cookie(name) {
    var r = document.cookie.match('\\b' + name + '=([^;]*)\\b');
    return r ? r[1] : undefined;
  }

  function update_modal(title, body) {
    if ($modal) {
      $modal.find('.modal-title').text(title);
      $modal.find('.modal-body').html(body);
      $modal.modal('show');
    } else {
      $modal = dialog.modal({
        notebook: notebook,
        keyboard_manager: keyboard_manager,
        title: title,
        body: body,
        buttons: {'Close': {}}
      });
    }
  }

  function set_toolbar_button_css(action_name, d) {
    var x = 'button[data-jupyter-action="X"]';
    $toolbar.find(x.replace('X', action_name)).css(d);
  }

  function load_ipython_extension() {
    var actions = keyboard_manager.actions;
    var shortcuts = keyboard_manager.command_shortcuts;
    var preview_tool_action_name = actions.register({
      'icon': 'fa-paper-plane-o',
      'help': 'preview tool',
      'help_index': 'crosscompute-preview',
      'handler': preview_tool
    }, 'tool-preview', 'crosscompute');
    var deploy_tool_action_name = actions.register({
      'icon': 'fa-paper-plane-o',
      'help': 'deploy tool',
      'help_index': 'crosscompute-deploy',
      'handler': deploy_tool
    }, 'tool-deploy', 'crosscompute');

    shortcuts.add_shortcut('Shift-C,Shift-P', preview_tool_action_name);
    shortcuts.add_shortcut('Shift-C,Shift-D', deploy_tool_action_name);

    jupyter.toolbar.add_buttons_group([
      preview_tool_action_name,
      deploy_tool_action_name
    ]);

    set_toolbar_button_css(preview_tool_action_name, {'background-color': '#286090', 'color': '#e6e6e6'});
    set_toolbar_button_css(deploy_tool_action_name, {'background-color': '#d9534f', 'color': '#e6e6e6'});
  }

  return {
    load_ipython_extension: load_ipython_extension
  };

});
