import React from 'react';
import {Input} from 'reactstrap';
import {Field as FormikField} from "formik";


export function Field({children, ...props}) {
    return <FormikField  {...props} component={({field, form, ...innerProps}) => {
        return <Input {...field} {...innerProps}>{children}</Input>;
    }}/>
}

export function Select({options, ...props}) {
    props["type"] = "select";
    return <Field {...props}>{Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Field>
}