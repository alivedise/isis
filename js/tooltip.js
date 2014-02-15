/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2 -*- */
(function(exports) {
  var Tooltip = function() {
    this.init();
  };
  Tooltip.prototype = new EventEmitter();
  Tooltip.prototype.constructor = Tooltip;
  Tooltip.prototype.containerElement = $('body');
  Tooltip.prototype.template = function() {
    return '<div class="alert alert-info isis-tooltip" id="isis-tooltip">' +
              '<div><span>TaskID</span><span class="taskId label label-default pull-right"></span></div>' +
              '<div><span>SourceEventType</span><span class="sourceEventType label label-default pull-right"></span></div>' +
              '<div><span>SourceEventID</span><span class="label label-default pull-right"><span class="colorSample">█ </span><span class="sourceEventId"></span></span></div>' +
              '<div><span>Latency</span><span class="latency label label-info pull-right"></span></div>' +
              '<div><span>Execution</span><span class="execution label label-info pull-right"></span></div>' +
            '</div>';
  };

  Tooltip.prototype.init = function() {
    this.render();
    this.register();
  };

  Tooltip.prototype.render = function() {
    if (this._rendered) {
      return;
    }
    this._rendered = true;
    this.containerElement.append(this.template());
    this.element = $('#isis-tooltip');
    this.element.hide();
  };

  Tooltip.prototype.register = function() {
    if (this._registered) {
      return;
    }
    this._registered = true;
    window.broadcaster.on('-task-hovered', function(task, x, y) {
      if (this.element.find('.taskId').text() === String(task.taskId)) {
        return;
      }
      this.element.find('.labels').remove();
      this.element.find('.taskId').text(task.taskId);
      this.element.find('.sourceEventId').text(task.sourceEventId);
      this.element.find('.sourceEventType').text(task.sourceEventType);
      this.element.find('.execution').text(task.end - task.start);
      this.element.find('.latency').text(task.start - task.dispatch);
      this.element.find('.colorSample').css({ color: window.app.colorManager.getColor(task.sourceEventId)});
      
      if (task.labels && task.labels.length) {
        this.element.append('<div class="labels"><hr/></div>');
        task.labels.forEach(function(label) {
          this.element.find('.labels').append('<div><span class="label label-info">'+label.timestamp+'</span><span>'+label.label+'</span></div>')
        }, this);
      }

      this.element.show().css({ left: x, top: y });
    }.bind(this));
    window.broadcaster.on('-task-out', function(task, x, y) {
      this.element.find('.taskId').text("");
      this.element.hide();
    }.bind(this));
  };

  exports.Tooltip = Tooltip;
}(this));