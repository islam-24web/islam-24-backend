import React, { useState, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Flex, Field } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import styled from 'styled-components';

const EditorWrapper = styled.div`
  .ck-editor__editable {
    min-height: 300px;
    max-height: 600px;
    direction: rtl;
    text-align: right;
  }
`;

const CKEditorInput = ({ attribute, name, disabled, error, intlLabel, required, description, labelAction }) => {
  const { onChange, value } = useField(name);
  const { formatMessage } = useIntl();
  const editorRef = useRef(null);
  const [ready, setReady] = useState(false);

  const licenseKey = attribute?.options?.licenseKey || '';

  const editorConfig = {
    licenseKey,
    language: 'ar',
  };

  const handleReady = useCallback((editor) => {
    editorRef.current = editor;
    setReady(true);
  }, []);

  return (
    <Field.Root name={name} id={name} error={error} hint={description && formatMessage(description)}>
      <Flex spacing={1} alignItems="normal" style={{ flexDirection: 'column' }}>
        <Field.Label action={labelAction} required={required}>
          {intlLabel ? formatMessage(intlLabel) : name}
        </Field.Label>
        <EditorWrapper>
          <CKEditor
            editor={ClassicEditor}
            data={value ?? ''}
            onReady={handleReady}
            onChange={(event, editor) => {
              const data = editor.getData();
              onChange({ target: { name, value: data } });
            }}
            config={editorConfig}
          />
        </EditorWrapper>
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
};

export { CKEditorInput };
