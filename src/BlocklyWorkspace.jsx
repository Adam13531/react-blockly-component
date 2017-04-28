import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

var debounce = function(func, wait) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

var BlocklyWorkspace = React.createClass({
  propTypes: {
    initialXml: PropTypes.string,
    updateWorkspaceBasedOnXml: PropTypes.bool.isRequired,
    workspaceConfiguration: PropTypes.object,
    wrapperDivClassName: PropTypes.string,
    xmlDidChange: PropTypes.func,
    codeDidChange: PropTypes.func,
    languageToGenerate: PropTypes.string,
    onImportXmlError: PropTypes.func,
    toolboxMode: PropTypes.oneOf(['CATEGORIES', 'BLOCKS'])
  },

  getInitialState: function() {
    return {
      workspace: null,
      xml: this.props.initialXml,
      code: null,
    };
  },

  componentDidMount: function() {
    // TODO figure out how to use setState here without breaking the toolbox when switching tabs
    this.state.workspace = Blockly.inject(
      this.refs.editorDiv,
      Object.assign({}, (this.props.workspaceConfiguration || {}), {
        toolbox: ReactDOM.findDOMNode(this.refs.dummyToolbox)
      })
    );

    if (this.state.xml) {
      if (this.importFromXml(this.state.xml)) {
        this.xmlDidChange();

        // There was XML, so there should probably be code as well.
        const code = this.getCodeFromWorkspace();
        this.setState({code}, this.codeDidChange);
      } else {
        this.setState({xml: null, code: null}, () => {
          this.xmlDidChange();
          this.codeDidChange();
        });
      }
    }

    this.state.workspace.addChangeListener(debounce(function() {
      var newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.state.workspace));

      // If the XML didn't change, then the code couldn't possibly have changed.
      if (newXml == this.state.xml) {
        return;
      }

      this.checkIfCodeChanged();

      this.setState({xml: newXml}, this.xmlDidChange);
    }.bind(this), 200));
  },

  checkIfCodeChanged: function() {
    const newCode = this.getCodeFromWorkspace();
    if (newCode !== this.state.code) {
      this.setState({code: newCode}, this.codeDidChange);
    }
  },

  getCodeFromWorkspace: function() {
    if (this.props.languageToGenerate) {
      const code = Blockly[this.props.languageToGenerate].workspaceToCode(this.state.workspace);
      return code;
    } else {
      return null;
    }
  },

  importFromXml: function(xml) {
    try {
      // Clear it in case we already had a workspace, that way we don't end up
      // adding to the existing workspace.
      this.state.workspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.state.workspace);
      return true;
    } catch (e) {
      if (this.props.onImportXmlError) {
        this.props.onImportXmlError(e);
      }
      return false;
    }
  },

  componentWillReceiveProps: function(newProps) {
    if (this.props.initialXml != newProps.initialXml) {
      this.setState({xml: newProps.initialXml}, () =>  {
        if (newProps.updateWorkspaceBasedOnXml) {
          this.importFromXml(newProps.initialXml);
        }
      });

      this.checkIfCodeChanged();
    }
  },

  componentWillUnmount: function() {
    if (this.state.workspace) {
      this.state.workspace.dispose();
    }
  },

  shouldComponentUpdate: function() {
    return false;
  },

  xmlDidChange: function() {
    if (this.props.xmlDidChange) {
      this.props.xmlDidChange(this.state.xml);
    }
  },

  // The code can only change when the XML changes, but it doesn't necessarily
  // change every time the XML changes (e.g. if you just relocated a block).
  codeDidChange: function() {
    if (this.props.codeDidChange) {
      this.props.codeDidChange(this.state.code);
    }
  },

  toolboxDidUpdate: function(toolboxNode) {
    if (toolboxNode && this.state.workspace) {
      this.state.workspace.updateToolbox(toolboxNode);
    }
  },

  resize: function() {
    Blockly.svgResize(this.state.workspace);
  },

  render: function() {
    // We have to fool Blockly into setting up a toolbox with categories initially;
    // otherwise it will refuse to do so after we inject the real categories into it.
    var dummyToolboxContent;
    if (this.props.toolboxMode === "CATEGORIES") {
      dummyToolboxContent = (
        <category name="Dummy toolbox" />
      );
    }

    return (
      <div className={this.props.wrapperDivClassName}>
        <xml style={{display: "none"}} ref="dummyToolbox">
          {dummyToolboxContent}
        </xml>
        <div ref="editorDiv" className={this.props.wrapperDivClassName} />
      </div>
    );
  }
});

export default BlocklyWorkspace;
