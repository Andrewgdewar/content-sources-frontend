import {
  FormGroup,
  Grid,
  Text,
  TextArea,
  TextInput,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { useAddTemplateContext } from '../AddTemplateContext';
import { useState } from 'react';
import { TemplateValidationSchema } from '../../templateHelpers';
import CustomHelperText from 'components/CustomHelperText/CustomHelperText';

export default function DetailStep() {
  const { templateRequest, setTemplateRequest } = useAddTemplateContext();
  const [errors, setErrors] = useState({ name: '', description: '' });

  const setFieldValues = (value: string, field: 'name' | 'description') => {
    setTemplateRequest((prev) => ({ ...prev, [field]: value }));
    try {
      TemplateValidationSchema.validateSyncAt(field, { [field]: value });
      if (errors[field]) setErrors({ ...errors, [field]: '' });
    } catch (err) {
      const message = (err as Error).message;
      setErrors({ ...errors, [field]: message });
    }
  };

  return (
    <Grid hasGutter>
      <Title ouiaId='enter_template_details' headingLevel='h1'>
        Enter template details
      </Title>
      <Text component={TextVariants.h6}>Enter a name and description for your template.</Text>

      <FormGroup label='Name' isRequired>
        <TextInput
          isRequired
          id='name'
          name='name'
          label='Name'
          ouiaId='input_name'
          type='text'
          validated={errors.name ? 'error' : 'default'}
          onChange={(_event, value) => setFieldValues(value, 'name')}
          value={templateRequest?.name || ''}
          placeholder='Enter name'
        />
        <CustomHelperText hide={!errors.name} textValue={errors.name} />
      </FormGroup>
      <FormGroup label='Description'>
        <TextArea
          id='description'
          name='description'
          label='Description'
          data-ouia-component-id='input_description'
          type='text'
          validated={errors.description ? 'error' : 'default'}
          onChange={(_event, value) => setFieldValues(value, 'description')}
          value={templateRequest?.description || ''}
          placeholder='Enter description'
        />
        <CustomHelperText hide={!errors.description} textValue={errors.description} />
      </FormGroup>
    </Grid>
  );
}
