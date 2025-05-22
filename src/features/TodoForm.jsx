import { useRef } from 'react';
import { useState } from 'react';
import TextInputWithLabel from '../shared/TextInputWithLabel';
import styled from 'styled-components';

export default function TodoForm({ onAddTodo }) {
  const todoTitleInput = useRef('');
  const [workingTodo, setWorkingTodo] = useState('');

  function handleAddTodo(event) {
    event.preventDefault();
    //const title = event.target.title.value;
    onAddTodo({
      title: workingTodo,
      isCompleted: false,
    });
    setWorkingTodo('');
    //event.target.title.value = '';
    todoTitleInput.current.focus();
  }

  return (
    <StyledForm onSubmit={handleAddTodo}>
      <StyledTextInputWithLabel
        value={workingTodo}
        ref={todoTitleInput}
        onChange={(e) => setWorkingTodo(e.target.value)}
        elementId="todoTitle"
        labelText="Todo"
      ></StyledTextInputWithLabel>
      <StyledButton type="submit" disabled={workingTodo === ''}>
        Add Todo
      </StyledButton>
    </StyledForm>
  );
}

const StyledForm = styled.form`
  padding: 0.5rem 0;
`;

const StyledTextInputWithLabel = styled(TextInputWithLabel)`
  padding: 0.4rem;
  margin-right: 0.5rem;
`;

const StyledButton = styled.button`
  padding: 0.4rem 0.8rem;
  font-style: ${({ disabled }) => (disabled ? 'italic' : 'normal')};
`;
