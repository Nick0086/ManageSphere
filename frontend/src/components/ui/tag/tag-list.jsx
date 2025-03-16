import { Tag } from './tag';
import { cn } from '@/lib/utils';


export const TagList = ({
  tags,
  customTagRenderer,
  direction,
  className,
  inlineTags,
  activeTagIndex,
  setActiveTagIndex,
  classStyleProps,
  disabled,
  ...tagListProps
}) => {

  return (
    <>
      {!inlineTags ? (
        <div
          className={cn(
            'rounded-md w-full',
            {
              'flex flex-wrap gap-2': direction === 'row',
              'flex flex-col gap-2': direction === 'column',
            },
            classStyleProps?.tagListClasses?.container,
          )}
        >
          {tags.map((tagObj, index) =>
            customTagRenderer ? (
              customTagRenderer(tagObj, index === activeTagIndex)
            ) : (
              <Tag
                key={tagObj.id}
                tagObj={tagObj}
                isActiveTag={index === activeTagIndex}
                direction={direction}
                tagClasses={classStyleProps?.tagClasses}
                {...tagListProps}
                disabled={disabled}
              />
            ),
          )}
        </div>
      ) : (
        <>
          {tags.map((tagObj, index) =>
            customTagRenderer ? (
              customTagRenderer(tagObj, index === activeTagIndex)
            ) : (
              <Tag
                key={tagObj.id}
                tagObj={tagObj}
                isActiveTag={index === activeTagIndex}
                direction={direction}
                tagClasses={classStyleProps?.tagClasses}
                {...tagListProps}
                disabled={disabled}
              />
            ),
          )}
        </>
      )}
    </>
  );
};