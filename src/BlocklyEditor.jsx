import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

import BlocklyToolbox from './BlocklyToolbox';
import BlocklyWorkspace from './BlocklyWorkspace';

var BlocklyEditor = React.createClass({
  propTypes: {
    initialXml: React.PropTypes.string,
    updateWorkspaceBasedOnXml: React.PropTypes.bool.isRequired,
    workspaceConfiguration: React.PropTypes.object,
    wrapperDivClassName: React.PropTypes.string,
    toolboxCategories: React.PropTypes.array,
    xmlToolboxCategories: React.PropTypes.string,
    toolboxBlocks: React.PropTypes.array,
    xmlDidChange: React.PropTypes.func,
    codeDidChange: React.PropTypes.func,
    languageToGenerate: React.PropTypes.string,
    onImportXmlError: React.PropTypes.func,
    processToolboxCategory: React.PropTypes.func
  },

  toolboxDidUpdate: function() {
    var workspaceConfiguration = this.props.workspaceConfiguration || {};
    if (this.refs.workspace && !workspaceConfiguration.readOnly) {
      this.refs.workspace.toolboxDidUpdate(ReactDOM.findDOMNode(this.refs.toolbox));
    }
  },

  componentDidMount: function() {
    const { toolboxCategories, xmlToolboxCategories } = this.props;

    if (typeof toolboxCategories !== 'undefined' && typeof xmlToolboxCategories !== 'undefined') {
      throw new Error(`A BlocklyEditor should either have a prop 'toolboxCategories' or 'xmlToolboxCategories' but not both.`);
    }

    this.toolboxDidUpdate();
  },

  xmlDidChange: function(newXml) {
    if (this.props.xmlDidChange) {
      this.props.xmlDidChange(newXml);
    }
  },

  codeDidChange: function (newCode) {
    if (this.props.codeDidChange) {
      this.props.codeDidChange(newCode);
    }
  },

  importFromXml: function(xml) {
    return this.refs.workspace.importFromXml(xml);
  },

  resize: function() {
    this.refs.workspace.resize();
  },

  render: function() {
    var toolboxMode;
    if (this.props.toolboxCategories || this.props.xmlToolboxCategories) {
      toolboxMode = "CATEGORIES";
    } else if (this.props.toolboxBlocks) {
      toolboxMode = "BLOCKS";
    }

    const { toolboxCategories, xmlToolboxCategories } = this.props;

    return (
      <div className={this.props.wrapperDivClassName}>
        <BlocklyToolbox
          categories={xmlToolboxCategories ? xmlToolboxCategories : Immutable.fromJS(toolboxCategories)}
          blocks={Immutable.fromJS(this.props.toolboxBlocks)}
          didUpdate={this.toolboxDidUpdate}
          processCategory={this.props.processToolboxCategory}
          ref="toolbox" />
        <BlocklyWorkspace ref="workspace"
          initialXml={this.props.initialXml}
          updateWorkspaceBasedOnXml={this.props.updateWorkspaceBasedOnXml}
          onImportXmlError={this.props.onImportXmlError}
          toolboxMode={toolboxMode}
          xmlDidChange={this.xmlDidChange}
          codeDidChange={this.codeDidChange}
          languageToGenerate={this.props.languageToGenerate}
          wrapperDivClassName={this.props.wrapperDivClassName}
          workspaceConfiguration={this.props.workspaceConfiguration} />
      </div>
    );
  }
});

export default BlocklyEditor;
