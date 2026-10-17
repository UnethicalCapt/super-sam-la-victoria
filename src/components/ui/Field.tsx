export interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, required, children }) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-200 mb-1"
      >
        {label}{required ? ' *' : ''}
      </label>
      {children}
    </div>
  )
}
