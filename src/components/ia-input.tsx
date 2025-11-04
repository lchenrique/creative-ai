import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from '@/components/ui/prompt-input';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export interface PromptInputBasicProps {
    onSubmit: (value: string) => void;

}

export function PromptInputBasic({ onSubmit }: PromptInputBasicProps) {
    const [value, setValue] = useState('');

    const handleValueChange = (newValue: string) => {
        setValue(newValue);
    }


    return (
        <PromptInput
            value={value}
            onSubmit={() => onSubmit(value)}
            onValueChange={handleValueChange}>
            <PromptInputTextarea placeholder='Ask prompt-kit' />
            <PromptInputActions className='w-full flex justify-end'>
                <PromptInputAction tooltip='Upload File'>
                    <Button variant="outline">Upload File</Button>
                </PromptInputAction>
                <PromptInputAction tooltip='Send' >
                    <Button onClick={() => onSubmit(value)} className='rounded-full left-auto' type='button'>
                        <Send />
                    </Button>
                </PromptInputAction>
            </PromptInputActions>
        </PromptInput >
    );
}