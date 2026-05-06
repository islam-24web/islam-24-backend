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
  }
  .ck-editor__editable[contenteditable="true"] {
    direction: rtl;
    text-align: right;
  }
  /* Force remove read-only class if present */
  .ck-editor__editable.ck-read-only {
    pointer-events: auto !important;
  }
`;

const CKEditorInput = ({ attribute, name, error, intlLabel, required, description, labelAction }) => {
  const { onChange, value } = useField(name);
  const { formatMessage } = useIntl();

  const licenseKey = attribute?.options?.licenseKey || '';

  const editorConfig = {
    licenseKey,
    language: { ui: 'en', content: 'ar' },
  };

  const handleReady = useCallback((editor) => {
    // Ensure editor is always editable — never read-only
    editor.disableReadOnlyMode('strapi');
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
