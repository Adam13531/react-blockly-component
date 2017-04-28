import { is } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import React from 'react';

import BlocklyToolboxCategory from './BlocklyToolboxCategory';
import BlocklyToolboxBlock from './BlocklyToolboxBlock';

var BlocklyToolbox = React.createClass({
  propTypes: {
    categories: PropTypes.oneOfType([
      ImmutablePropTypes.list,
      PropTypes.string,
    ]),
    blocks: ImmutablePropTypes.list,
    processCategory: PropTypes.func,
    didUpdate: PropTypes.func
  },

  renderCategories: function(categories) {
    return categories.map(function(category, i) {
      if (category.get('type') === 'sep') {
        return <sep key={"sep_" + i}></sep>;
      } else if (category.get('type') === 'search') {
        return <search key={"search_" + i}/>;
      } else {
        return <BlocklyToolboxCategory
          name={category.get('name')}
          custom={category.get('custom')}
          colour={category.get('colour')}
          key={"category_" + category.get('name') + "_" + i}
          blocks={category.get('blocks')}
          categories={category.get('categories')} />;
      }
    }.bind(this));
  },

  shouldComponentUpdate: function(nextProps) {
    const { categories, blocks } = this.props;

    if (typeof categories === 'string') {
      return categories !== nextProps.categories;
    }

    return !(is(nextProps.categories, this.props.categories) && is(nextProps.blocks, this.props.blocks));
  },

  componentDidMount: function() {
    this.props.didUpdate();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this.props.didUpdate();
  },

  processCategory: function(category) {
    var processedCategory = category;

    if (processedCategory.has('categories')) {
      processedCategory = category.update('categories', function(subcategories) {
        return subcategories.map(this.processCategory);
      }.bind(this));
    }

    if (this.props.processCategory) {
      return this.props.processCategory(processedCategory);
    }

    return processedCategory;
  },

  render: function() {
    const { categories, blocks } = this.props;

    if (categories) {
      if (typeof categories === 'string') {
        return <xml style={{display: "none"}} dangerouslySetInnerHTML={{ __html: categories }} />;
      } else {
        return (
          <xml style={{display: "none"}}>
            {this.renderCategories(categories.map(this.processCategory))}
          </xml>
        );
      }
    } else {
      return (
        <xml style={{display: "none"}}>
          {blocks.map(BlocklyToolboxBlock.renderBlock)}
        </xml>
      );
    }
  }
});

export default BlocklyToolbox;
