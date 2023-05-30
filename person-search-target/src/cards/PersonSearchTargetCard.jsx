import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React from 'react';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

const PersonSearchTargetCard = (props) => {
    const { classes } = props;

    return (
        <div className={classes.card}>
            <Typography variant="h2">
                Click or tap on this card
            </Typography>
        </div>
    );
};

PersonSearchTargetCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PersonSearchTargetCard);