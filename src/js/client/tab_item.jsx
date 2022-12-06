const stringSpanner = require("./string_spanner");

const MATCH_START = '<span class="match">';
const MATCH_END = "</span>";

module.exports = React.createClass({
    render: function() {
        /* jshint ignore:start */
        const closeButton = this.props.selected ? (
            <div className="close-button" onClick={this.onClickCloseButton}>
                &times;
            </div>
        ) : null;

        return (
            <li
                className={this.className()}
                onClick={this.onClick}
                onMouseMove={this.onMouseMove}>
                <div>
                    <div className="bkg" style={this.iconBkg(this.props.tab)} />
                    <span
                        className="title"
                        dangerouslySetInnerHTML={{
                            __html: this.tabTitle(this.props.tab)
                        }}
                    />
                </div>
                <div
                    className="url"
                    dangerouslySetInnerHTML={{
                        __html: this.tabUrl(this.props.tab)
                    }}
                />
                {closeButton}
            </li>
        );
        /* jshint ignore:end */
    },

    componentDidUpdate: function() {
        if (this.props.selected) {
            this.ensureVisible();
        }
    },

    ensureVisible: function() {
        const node = this.getDOMNode();
        const myTop = node.offsetTop;
        const myBottom = myTop + node.offsetHeight;
        const containerScrollTop = this.props.containerScrollTop;
        const containerScrollBottom =
            containerScrollTop + this.props.containerHeight;

        if (myTop < containerScrollTop) this.props.setContainerScrollTop(myTop);
        if (myBottom > containerScrollBottom)
            this.props.setContainerScrollTop(
                containerScrollTop + myBottom - containerScrollBottom
            );
    },

    iconBkg: function(tab) {
        return { backgroundImage: "url(" + tab.favIconUrl + ")" };
    },

    className: function() {
        return this.props.selected ? "selected" : "";
    },

    tabTitle: function(tab) {
        return stringSpanner(
            tab.title,
            this.props.filter,
            MATCH_START,
            MATCH_END
        );
    },

    tabUrl: function(tab) {
        return stringSpanner(
            tab.url,
            this.props.filter,
            MATCH_START,
            MATCH_END
        );
    },

    onMouseMove: function(evt) {
        this.props.changeSelected(this.props.tab);
    },

    onClick: function(evt) {
        this.props.activateSelected();
    },

    onClickCloseButton: function(evt) {
        evt.stopPropagation();
        this.props.closeSelected();
    }
});
