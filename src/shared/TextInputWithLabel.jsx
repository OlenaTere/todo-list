import styled from 'styled-components';

export function TextInputWithLabel({
  className,
  elementId,
  label,
  onChange,
  ref,
  value,
}) {
  return (
    <StyledWrapper className={className}>
      <label htmlFor={elementId}>{label}</label>
      <StyledInput
        type="text"
        id={elementId}
        ref={ref}
        value={value}
        onChange={onChange}
      />
    </StyledWrapper>
  );
}

export default TextInputWithLabel;

const StyledWrapper = styled.div`
  padding: 0.5rem 0;
`;

const StyledInput = styled.input`
  padding: 0.4rem;
`;
