import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/types/sow";

interface Props {
  question: Question;
  index: number;
  value: string;
  onChange: (v: string) => void;
}

export const QuestionRow = ({ question, index, value, onChange }: Props) => {
  return (
    <div className="question-card grid grid-cols-1 md:grid-cols-[30%_70%] gap-4 md:gap-5">
      <div>
        <div className="flex items-start gap-3">
          <span className="text-base font-mono text-primary mt-1">{index}</span>
          <label className="field-label leading-relaxed text-base">{question.label}</label>
        </div>
      </div>
      <div>
        <Textarea
          rows={4}
          placeholder={question.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="resize-y bg-input/60 placeholder:text-muted-foreground/60 text-base"
        />
      </div>
    </div>
  );
};
