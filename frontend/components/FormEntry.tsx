import * as Form from '@radix-ui/react-form'
import { TextField } from '@radix-ui/themes'
import { FC } from 'react'

const FormEntry: FC<{
  isRequired?: boolean
  name: string
  type?: 'text' | 'password' | 'email'
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}> = ({
  isRequired = false,
  type = 'text',
  name,
  onChange: handleChange,
  value = '',
}) => (
  <Form.Field name={name} className='my-3'>
    <Form.Label className='capitalize'>
      {name} {isRequired && <span className='text-red-500'>*</span>}
    </Form.Label>
    <Form.Control asChild>
      <TextField.Root
        type={type}
        required={isRequired}
        onChange={handleChange}
        value={value}
      />
    </Form.Control>
    <Form.Message match='valueMissing' color='red' className='text-red-500'>
      Please enter a {name}.
    </Form.Message>
    <Form.Message match='typeMismatch' color='red' className='text-red-500'>
      Please enter a valid {name}.
    </Form.Message>
  </Form.Field>
)

export default FormEntry
