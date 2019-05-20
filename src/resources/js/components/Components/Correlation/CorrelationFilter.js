import React     from 'react';
import PropTypes from 'prop-types';
import Slider    from 'rc-slider';
import Tooltip   from 'rc-tooltip';

const Handle = Slider.Handle;

const handleTooltip = ({ value, dragging, index, ...restProps }) => {
    return (
        <Tooltip prefixCls="rc-slider-tooltip" overlay={value} visible={dragging} placement="top" key={index}>
            <Handle value={value} {...restProps} />
        </Tooltip>
    );
};

export default class CorrelationFilter extends React.Component {

    static propTypes = {
        onFilter: PropTypes.func.isRequired,
        getFilter: PropTypes.func,
    };

    state = {
        sliderValue: 0.5,
    };

    componentDidMount () {
        const { getFilter } = this.props;
        if (getFilter) {
            getFilter((v) => {
                this.setState({
                    sliderValue: v,
                });
            });
        }
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (prevState.sliderValue !== this.state.sliderValue) {
            this.props.onFilter(this.state.sliderValue);
        }
    }

    filter = (v) => {
        this.setState({
            sliderValue: v,
        });
    };

    render () {
        return (
            <Slider min={0.5} max={1.0} defaultValue={0.5} value={this.state.sliderValue} step={0.01}
                    handle={handleTooltip} onChange={this.filter}/>
        );
    }
}
