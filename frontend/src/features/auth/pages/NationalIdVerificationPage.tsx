import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import * as yup from 'yup';

const nationalIdSchema = yup.object().shape({
  nationalId: yup
    .string()
    .required('National ID is required')
    .min(10, 'National ID must be at least 10 characters'),
});

interface NationalIdFormData {
  nationalId: string;
}

export default function NationalIdVerificationPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: NationalIdFormData = {
    nationalId: '',
  };

  const handleSubmit = async (values: NationalIdFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call National ID verification API using didit.me
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('National ID verified successfully!');
      navigate('/register');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'National ID verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify with National ID"
      subtitle="Alternative verification using your National ID"
      showLogo={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={nationalIdSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-astu-navy/5 p-4 border border-astu-navy/10">
              <Shield className="h-5 w-5 text-astu-navy" />
              <p className="text-xs text-on-surface">
                We'll verify your identity using didit.me National ID verification
              </p>
            </div>

            <Field
              name="nationalId"
              as={AuthInput}
              label="National ID"
              type="text"
              placeholder="Enter your National ID number"
              value={values.nationalId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nationalId}
              touched={touched.nationalId}
              disabled={isLoading}
              required
              autoComplete="off"
            />

            <div className="rounded-lg bg-astu-navy/5 p-4">
              <p className="text-xs text-on-surface-variant">
                <strong>Note:</strong> Your National ID will be verified securely through didit.me. 
                This information is used only for identity verification purposes.
              </p>
            </div>

            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Verify National ID
            </AuthButton>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm text-on-surface-variant hover:text-astu-navy"
              >
                ← Back to OTP verification
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
