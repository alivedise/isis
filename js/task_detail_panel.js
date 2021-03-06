'use strict';
(function(exports) {
  var Mapping = ['UNKNOWN', 'TOUCH', 'MOUSE', 'KEY', 'BLUETOOTH', 'UNIXSOCKET', 'WIFI'];
  /**
   * TaskDetailPanel for task.
   * @requires Filter
   */
  var TaskDetailPanel = function(app) {
    this.app = app;
    this.init();
  };
  TaskDetailPanel.prototype = new EventEmitter();
  TaskDetailPanel.prototype.constructor = TaskDetailPanel;
  TaskDetailPanel.prototype.containerElement = $('.layout-west');
  TaskDetailPanel.prototype.template = function() {
    return '<div id="task-detail-panel">' +
              '<div><input type="checkbox" name="tooltip-source-event-id" value="" /></button><label>Show relavant tasks only.</label></div>' +
              '<div><span>Name</span><h4 class="name"></h4></div>' +
              '<div><span>TaskID</span><span class="clickable taskId label label-default pull-right"></span></div>' +
              '<div><span>SourceEventType</span><span class="sourceEventType label label-default pull-right"></span></div>' +
              '<div><span>SourceEventID</span><span class="label label-default pull-right"><span class="colorSample">█ </span><span class="mayclick sourceEventId"></span></span></div>' +
              '<div><span>Start</span><span class="start label label-info pull-right"></span></div>' +
              '<div><span>Latency</span><span class="latency label label-info pull-right"></span></div>' +
              '<div><span>Execution</span><span class="execution label label-info pull-right"></span></div>' +
              '<div><span>Task ID of parent task</span><span class="mayclick parent-task-thread-id label label-info pull-right"></span></div>' +
            '</div>';
  };

  TaskDetailPanel.prototype.init = function() {
    this.render();
    this.register();
  };

  TaskDetailPanel.prototype.render = function() {
    if (this._rendered) {
      return;
    }
    this._rendered = true;
    this.containerElement.append(this.template());
    this.element = $('#task-detail-panel');
    var element = this.element
    this.element.find('[name="tooltip-source-event-id"]').change(function(){
      if ($(this).is(':checked')) {
        window.broadcaster.emit('-source-event-id-filtered',
          element.data('task').sourceEventId);
      } else {
        window.broadcaster.emit('-source-event-id-filtered');
      }
    });
  };

  TaskDetailPanel.prototype.register = function() {
    if (this._registered) {
      return;
    }
    this._registered = true;
    this._lastfocus = "";
    this.element.find('.taskId').click(function() {
      var taskId = this.element.find('.taskId').text();
      var tasks = window.app.taskManager.getTasks();
      var task = tasks[taskId];
      if (!task) {
        return;
      }
      window.broadcaster.emit('focus-task', task.view.execution);
      window.broadcaster.emit('thread-focused', task.threadId);
      this._lastfocus = "";
    }.bind(this));
    this.element.find('.parent-task-thread-id').click(function() {
      var parentId = this.element.find('.parent-task-thread-id').text();
      var tasks = window.app.taskManager.getTasks();
      var task = tasks[parentId];
      if (!task) {
        return;
      }
      window.broadcaster.emit('focus-task', task.view.execution);
      window.broadcaster.emit('thread-focused', task.threadId);
      if (this._lastfocus == "parentId") {
        window.broadcaster.emit('-task-hovered', task);
      } else {
        this._lastfocus = "parentId";
      }
    }.bind(this));
    this.element.find('.sourceEventId').click(function() {
      var sourceEventId = this.element.find('.sourceEventId').text();
      var tasks = window.app.taskManager.getTasks();
      var task = tasks[sourceEventId];
      if (!task) {
        return;
      }
      window.broadcaster.emit('focus-task', task.view.execution);
      window.broadcaster.emit('thread-focused', task.threadId);
      if (this._lastfocus == "sourceEventId") {
        window.broadcaster.emit('-task-hovered', task);
      } else {
        this._lastfocus = "sourceEventId";
      }
    }.bind(this));

    window.broadcaster.on('-task-hovered', function(task) {
      this._lastfocus = "";
      this.element.data('task', task);
      if (this.element.find('.taskId').text() === String(task.taskId || task.id)) {
        return;
      }
      if (window.app.filter && window.app.filter.activeSourceEventId == task.sourceEventId) {
        this.element.find('[name="tooltip-source-event-id"]').prop('checked', true);
      } else {
        this.element.find('[name="tooltip-source-event-id"]').prop('checked', false);
      }
      this.element.find('.labels').remove();
      this.element.find('.taskId').text(task.taskId || task.id);
      this.element.find('.name').text(task.name || '(NULL)');
      this.element.find('.sourceEventId').text(task.sourceEventId);
      this.element.find('.sourceEventType').text(Mapping[Number(task.sourceEventType)]);
      this.element.find('.start').text(task.start);
      this.element.find('.execution').text(task.end - task.start);
      this.element.find('.latency').text(task.start - task.dispatch);
      this.element.find('.colorSample').css({ color: window.app.colorManager.getColor(task.sourceEventId)});
      if (task.parentTaskId) {
        this.element.find('.parent-task-thread-id').text(task.parentTaskId).css({ backgroundColor: window.app.colorManager.getColor(task.parentTaskId)});
      } else {
        this.element.find('.parent-task-thread-id').text('');
      }
      if (window.app.taskManager.getTask(task.sourceEventId)) {
	this.element.find('.sourceEventId').addClass('clickable');
      } else {
	this.element.find('.sourceEventId').removeClass('clickable');
      }
      if (window.app.taskManager.getTask(task.parentTaskId)) {
	this.element.find('.parent-task-thread-id').addClass('clickable');
      } else {
	this.element.find('.parent-task-thread-id').removeClass('clickable');
      }
      if (task.labels && task.labels.length) {
        this.element.append('<div class="labels"><hr/></div>');
        task.labels.forEach(function(label) {
          this.element.find('.labels').append('<div><span class="label label-info">' +
            ((label.timestamp || label[0]) - window.app.start) +
            '</span><span>'+(label.label || label[1]) +
            '</span></div>');
        }, this);
      }
      this.open();
    }.bind(this));
  };
  TaskDetailPanel.prototype.open = function() {
    window.broadcaster.emit('open-west');
  };

  exports.TaskDetailPanel = TaskDetailPanel;
}(this));