# Form builder

FormBuilder is a concept that helps building UI without much frontend or React knowledge. It's config-based entity that render and manages form. This for is connected to Saleor Metadata or other service.

## Use case

Majority of apps require only simple UI to get and set configuration (like tokens), usually in Saleor Metadata.

Writing good form, with validation, invalid states, error handling, loading, etc is time consuming and require a lot of boilerplate.

FormBuilder is opinionated, but should manage majority of simple use cases for apps

## Usage

```typescript
import {
  FormBuilder,
  useFormBuilder,
  MetadataManagerFormTarget,
} from "@saleor/app-sdk/form-builder";
import { privateMetadataManagerInstance } from "@lib";

// lib/config-form
export const configForm = new FormBuilder({
  fields: [
    {
      name: "token",
      label: "Token",
    },
  ],
});

// browser page
const Page = () => {
  const { form } = useFormBuilder(configForm, {
    apiEndpoint: "/api/settings",
    button: {
      label: "Save",
    },
    hooks: {
      onSubmit(values) {
        return values; // modify values if needed
      },
      // ... other hooks
    },
  });

  return form;
};

// /api/settings.ts

const handler = async (req) => {
  const configFormHandle = new FormBuilderHandle(configForm, {
    req,
    target: new MetadataManagerFormTarget(privateMetadataManagerInstance),
  });

  if (req.method === "POST") {
    const result = await configFormHandle.save();
  }
};
```
