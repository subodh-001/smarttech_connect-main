import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceDescription = ({ description, onDescriptionChange, minLength = 30 }) => {
  const maxLength = 500;
  const remainingChars = maxLength - (description?.length || 0);
  const trimmedLength = description?.trim()?.length || 0;
  const meetsMinLength = trimmedLength >= minLength;
  const charsNeeded = Math.max(0, minLength - trimmedLength);

  const helpfulPrompts = [
    "What exactly is the problem?",
    "When did you first notice this issue?",
    "Have you tried any solutions already?",
    "Is this urgent or can it wait?",
    "Any specific requirements or preferences?"
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Describe Your Problem</h3>
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e?.target?.value)}
            placeholder="Please describe the issue in detail. The more information you provide, the better we can match you with the right technician."
            className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={maxLength}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {remainingChars} characters remaining
          </div>
        </div>

        {trimmedLength < minLength && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="AlertCircle" size={16} className="text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-warning mb-1">
                  Add a little more detail
                </p>
                <p className="text-xs text-warning/80">
                  Describe the issue in at least {minLength} characters so technicians know what to expect.
                  {charsNeeded > 0 ? ` You need about ${charsNeeded} more characters.` : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {trimmedLength < 50 && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Need help describing your problem?</p>
                <div className="space-y-1">
                  {helpfulPrompts?.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newDescription = description + (description ? '\n\n' : '') + prompt + ' ';
                        onDescriptionChange(newDescription);
                      }}
                      className="block text-xs text-primary hover:text-primary/80 trust-transition"
                    >
                      • {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {meetsMinLength && (
          <div className="flex items-center space-x-2 text-sm text-success">
            <Icon name="CheckCircle" size={16} />
            <span>Great! Your description looks detailed enough.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDescription;