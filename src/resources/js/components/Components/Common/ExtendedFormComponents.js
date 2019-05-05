import React                                                               from 'react';
import { pick }                                                            from 'lodash';
import { Input, FormFeedback }                                             from 'reactstrap';
import { Field as FormikField, ErrorMessage as FormikErrorMessage, getIn } from 'formik/dist/index';

export function Field ({ children, onComponentRender = null, ...props }) {
    const renderComponent = ({ field, form, ...innerProps }) => {
        const n = field['name'];
        innerProps['id'] = n;
        const errors = getIn(form.errors, n);
        const touched = getIn(form.touched, n);
        innerProps['invalid'] = errors && ((Array.isArray(touched) && touched.length === 0) || touched);
        if (onComponentRender !== null && typeof onComponentRender === 'function') {
            const r = onComponentRender({ field, form, innerProps, children });
            field = r.field || field;
            innerProps = r.innerProps || innerProps;
            children = r.children || children;
        }
        return <Input {...field} {...innerProps}>{children}</Input>;
    };
    return <FormikField {...props} component={renderComponent}/>;
}

const OPTION_MAPPER = ([k, v]) => <option key={k} value={k}>{v}</option>;
const EMPTY_OPTION = (emptyText) => <option key="__EMPTY__" value="">{emptyText}</option>;

export function Select ({ options, addEmpty = false, emptyText = '', ...props }) {
    props['type'] = 'select';
    const entries = Object.entries(options).map(OPTION_MAPPER);
    if (addEmpty) {
        entries.unshift(EMPTY_OPTION(emptyText));
    }
    const isMultiple = props['multiple'] || false;
    if (isMultiple) {
        props['onComponentRender'] = ({ field, form }) => {
            const newFields = { ...field };
            newFields['onChange'] = evt => {
                form.setFieldValue(field.name,
                    [].slice.call(evt.target.selectedOptions).
                       map(o => o.value));
            };
            return { field: newFields };
        };
    }
    return <Field {...props}>{entries}</Field>;
}

const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    return [value];
};

export function ChainedSelect ({ options, addEmpty = false, emptyText = '', chainTo, emptyChained = false, ...props }) {
    props['type'] = 'select';
    const isMultiple = props['multiple'] || false;
    const onComponentRender = ({ field, form }) => {
        let chainedValues = ensureArray(getIn(form.values, chainTo) || '');
        const useAll = emptyChained && chainedValues.includes('');
        chainedValues = chainedValues.filter(v => (v !== ''));
        const toParse = (useAll) ? options : pick(options, chainedValues);
        const used = new Map();
        const entries = Object.values(toParse).flatMap(v => {
            return (Object.entries(v).map(([k, v]) => {
                if (used.has(k)) return null;
                used.set(k, k);
                return [k, v];
            }));
        }).filter(x => x != null).map(OPTION_MAPPER);
        if (addEmpty) {
            entries.unshift(EMPTY_OPTION(emptyText));
        }
        if (isMultiple) {
            const newFields = { ...field };
            newFields['onChange'] = evt => {
                form.setFieldValue(field.name,
                    [].slice.call(evt.target.selectedOptions).
                       map(o => o.value));
            };
            return { field: newFields, children: entries };
        } else {
            return { children: entries };
        }
    };
    return <Field {...props} onComponentRender={onComponentRender}/>;
}

export function ErrorMessage (props) {
    const renderComponent = msg => (<FormFeedback>{msg}</FormFeedback>);
    return <FormikErrorMessage {...props} render={renderComponent}/>;
}

export function ArrayErrorMessage ({ name }) {
    return (
        <FormikField
            name={name}
            render={({ form }) => {
                const error = getIn(form.errors, name);
                const touch = getIn(form.touched, name);
                return touch && error ? <FormFeedback>{error}</FormFeedback> : null;
            }}
        />
    );
}
