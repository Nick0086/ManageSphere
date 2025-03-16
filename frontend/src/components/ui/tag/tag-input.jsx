import React, { useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { CommandInput } from '../ui/command';
import { TagPopover } from './tag-popover';
import { TagList } from './tag-list';
import { Autocomplete } from './autocomplete';
import { cn } from '@/lib/utils';
import { v4 as uuid } from 'uuid';

const Delimiter = {
  Comma: ',',
  Enter: 'Enter',
};

const TagInput = React.forwardRef((props, ref) => {
  const {
    id,
    placeholder,
    tags,
    setTags,
    variant,
    size,
    shape,
    enableAutocomplete,
    autocompleteOptions,
    maxTags,
    delimiter = Delimiter.Comma,
    onTagAdd,
    onTagRemove,
    allowDuplicates,
    showCount,
    validateTag,
    placeholderWhenFull = 'Max tags reached',
    sortTags,
    delimiterList,
    truncate,
    autocompleteFilter,
    borderStyle,
    textCase,
    interaction,
    animation,
    textStyle,
    minLength,
    maxLength,
    direction = 'row',
    onInputChange,
    customTagRenderer,
    onFocus,
    onBlur,
    onTagClick,
    draggable = false,
    inputFieldPosition = 'bottom',
    clearAll = false,
    onClearAll,
    usePopoverForTags = false,
    inputProps = {},
    restrictTagsToAutocompleteOptions,
    inlineTags = true,
    addTagsOnBlur = false,
    activeTagIndex,
    setActiveTagIndex,
    styleClasses = {},
    disabled = false,
    usePortal = false,
    addOnPaste = false,
  } = props;

  const [inputValue, setInputValue] = React.useState('');
  const [tagCount, setTagCount] = React.useState(Math.max(0, tags.length));
  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  // Forward the ref to both container and input
  React.useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    container: containerRef.current,
    input: inputRef.current
  }));

  useEffect(() => {
    if (inputValue === "") {
      setActiveTagIndex(tags.length - 1);
    } else {
      setActiveTagIndex(null);
    }
  }, [inputValue]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
        setActiveTagIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAutocompleteOptions = useMemo(() => {
    return (autocompleteOptions || []).filter((option) =>
      option.text.toLowerCase().includes(inputValue ? inputValue.toLowerCase() : ''),
    );
  }, [inputValue, autocompleteOptions]);


  if ((maxTags !== undefined && maxTags < 0) || (props.minTags !== undefined && props.minTags < 0)) {
    console.warn('maxTags and minTags cannot be less than 0');
    return null;
  }
  const handleInputChange = (e) => {
    const newValue = e.target.value;

    if (addOnPaste && newValue.includes(delimiter)) {
      const splitValues = newValue
        .split(delimiter)
        .map((v) => v.trim())
        .filter((v) => v);

      const newTags = [...tags]; // Create copy of current tags

      splitValues.forEach((value) => {
        if (!value) return;

        const newTagText = value.trim();

        if (restrictTagsToAutocompleteOptions && !autocompleteOptions?.some((option) => option.text === newTagText)) {
          console.warn('Tag not allowed as per autocomplete options');
          return;
        }

        if (validateTag && !validateTag(newTagText)) {
          console.warn('Invalid tag as per validateTag');
          return;
        }

        if (minLength && newTagText.length < minLength) {
          console.warn(`Tag "${newTagText}" is too short`);
          return;
        }

        if (maxLength && newTagText.length > maxLength) {
          console.warn(`Tag "${newTagText}" is too long`);
          return;
        }

        const newTagId = uuid();

        if (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) {
          if (maxTags === undefined || newTags.length < maxTags) {
            newTags.push({ id: newTagId, text: newTagText });
          } else {
            console.warn('Reached the maximum number of tags allowed');
          }
        } else {
          console.warn(`Duplicate tag "${newTagText}" not added`);
        }
      });

      // Update tags once with final array
      setTags(newTags);
      setInputValue('');
    } else {
      setInputValue(newValue);
    }
    onInputChange?.(newValue);
  };

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target.classList.contains('tag-input-container')) {
      inputRef.current?.focus();
    }
  };

  const handleInputFocus = (event) => {
    setIsFocused(true);
    setActiveTagIndex(null);
    onFocus?.(event);
  };

  const handleInputBlur = (event) => {
    // Only blur if clicking outside the container
    if (!containerRef.current?.contains(event.relatedTarget)) {
      if (addTagsOnBlur && inputValue.trim()) {
        const newTagText = inputValue.trim();

        if (validateTag && !validateTag(newTagText)) {
          return;
        }

        if (minLength && newTagText.length < minLength) {
          console.warn('Tag is too short');
          return;
        }

        if (maxLength && newTagText.length > maxLength) {
          console.warn('Tag is too long');
          return;
        }

        if (
          (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) &&
          (maxTags === undefined || tags.length < maxTags)
        ) {
          const newTagId = crypto.getRandomValues(new Uint32Array(1))[0].toString();
          setTags([...tags, { id: newTagId, text: newTagText }]);
          onTagAdd?.(newTagText);
          setTagCount((prevTagCount) => prevTagCount + 1);
          setInputValue('');
        }
      }
      onBlur?.(event);
    }
  };

  const handleKeyDown = (e) => {
    if (delimiterList ? delimiterList.includes(e.key) : e.key === delimiter || e.key === Delimiter.Enter) {
      e.preventDefault();
      const newTagText = inputValue.trim();

      if (restrictTagsToAutocompleteOptions && !autocompleteOptions?.some((option) => option.text === newTagText)) {
        return;
      }

      if (validateTag && !validateTag(newTagText)) {
        return;
      }

      if (minLength && newTagText.length < minLength) {
        console.warn('Tag is too short');
        return;
      }

      if (maxLength && newTagText.length > maxLength) {
        console.warn('Tag is too long');
        return;
      }

      const newTagId = uuid();

      if (
        newTagText &&
        (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) &&
        (maxTags === undefined || tags.length < maxTags)
      ) {
        setTags([...tags, { id: newTagId, text: newTagText }]);
        onTagAdd?.(newTagText);
        setTagCount((prevTagCount) => prevTagCount + 1);
      }
      setInputValue('');
    } else {
      switch (e.key) {
        case 'Delete':
          if (activeTagIndex !== null) {
            e.preventDefault();
            const newTags = [...tags];
            newTags.splice(activeTagIndex, 1);
            setTags(newTags);
            setActiveTagIndex((prev) =>
              newTags.length === 0 ? null : prev >= newTags.length ? newTags.length - 1 : prev,
            );
            setTagCount((prevTagCount) => prevTagCount - 1);
            onTagRemove?.(tags[activeTagIndex].text);
          }
          break;
        case 'Backspace':
          if (activeTagIndex !== null) {
            e.preventDefault();
            const newTags = [...tags];
            newTags.splice(activeTagIndex, 1);
            setTags(newTags);
            setActiveTagIndex((prev) => (prev === 0 ? null : prev - 1));
            setTagCount((prevTagCount) => prevTagCount - 1);
            onTagRemove?.(tags[activeTagIndex].text);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (activeTagIndex === null) {
            setActiveTagIndex(0);
          } else {
            setActiveTagIndex((prev) => (prev + 1 >= tags.length ? 0 : prev + 1));
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (activeTagIndex === null) {
            setActiveTagIndex(tags.length - 1);
          } else {
            setActiveTagIndex((prev) => (prev === 0 ? tags.length - 1 : prev - 1));
          }
          break;
        case 'Home':
          e.preventDefault();
          setActiveTagIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveTagIndex(tags.length - 1);
          break;
      }
    }
  };

  const removeTag = (idToRemove) => {
    setTags(tags.filter((tag) => tag.id !== idToRemove));
    onTagRemove?.(tags.find((tag) => tag.id === idToRemove)?.text || '');
    setTagCount((prevTagCount) => prevTagCount - 1);
    inputRef.current?.focus();
  };

  const onSortEnd = (oldIndex, newIndex) => {
    setTags((currentTags) => {
      const newTags = [...currentTags];
      const [removedTag] = newTags.splice(oldIndex, 1);
      newTags.splice(newIndex, 0, removedTag);

      return newTags;
    });
  };

  const handleClearAll = () => {
    if (!onClearAll) {
      setActiveTagIndex(-1);
      setTags([]);
      return;
    }
    onClearAll?.();
  };

  const displayedTags = sortTags ? [...tags].sort() : tags;

  const truncatedTags = truncate
    ? tags.map((tag) => ({
      id: tag.id,
      text: tag.text?.length > truncate ? `${tag.text.substring(0, truncate)}...` : tag.text,
    }))
    : displayedTags;

  return (
    <div
      className={`w-full flex ${!inlineTags && tags.length > 0 ? 'gap-3' : ''} ${inputFieldPosition === 'bottom' ? 'flex-col' : inputFieldPosition === 'top' ? 'flex-col-reverse' : 'flex-row'
        }`}
    >
      {!usePopoverForTags &&
        (!inlineTags ? (
          <TagList
            tags={truncatedTags}
            customTagRenderer={customTagRenderer}
            variant={variant}
            size={size}
            shape={shape}
            borderStyle={borderStyle}
            textCase={textCase}
            interaction={interaction}
            animation={animation}
            textStyle={textStyle}
            onTagClick={onTagClick}
            draggable={draggable}
            onSortEnd={onSortEnd}
            onRemoveTag={removeTag}
            direction={direction}
            inlineTags={inlineTags}
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
            classStyleProps={{
              tagListClasses: styleClasses?.tagList,
              tagClasses: styleClasses?.tag,
            }}
            disabled={disabled}
          />
        ) : (
          !enableAutocomplete && (
            <div className="w-full">
              <div
                ref={containerRef}
                onClick={handleContainerClick}
                className={cn(
                  `flex flex-row flex-wrap items-center gap-2 p-2 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:border-primary disabled:cursor-not-allowed disabled:opacity-50 tag-input-container`,
                  isFocused && 'border-primary',
                  styleClasses?.inlineTagsContainer,
                )}
              >
                <TagList
                  tags={truncatedTags}
                  customTagRenderer={customTagRenderer}
                  variant={variant}
                  size={size}
                  shape={shape}
                  borderStyle={borderStyle}
                  textCase={textCase}
                  interaction={interaction}
                  animation={animation}
                  textStyle={textStyle}
                  onTagClick={onTagClick}
                  draggable={draggable}
                  onSortEnd={onSortEnd}
                  onRemoveTag={removeTag}
                  direction={direction}
                  inlineTags={inlineTags}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                  classStyleProps={{
                    tagListClasses: styleClasses?.tagList,
                    tagClasses: styleClasses?.tag,
                  }}
                  disabled={disabled}
                />
                <Input
                  ref={inputRef}
                  id={id}
                  type="text"
                  placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  {...inputProps}
                  className={cn(
                    'border-0 px-1 py-0 bg-transparent sm:min-w-focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 min-w-10 w-fit shadow-none h-6',
                    styleClasses?.input,
                  )}
                  autoComplete={enableAutocomplete ? 'on' : 'off'}
                  list={enableAutocomplete ? 'autocomplete-options' : undefined}
                  disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                />
              </div>
            </div>
          )
        ))}
      {enableAutocomplete ? (
        <div className="w-full">
          <Autocomplete
            tags={tags}
            setTags={setTags}
            setInputValue={setInputValue}
            autocompleteOptions={filteredAutocompleteOptions}
            setTagCount={setTagCount}
            maxTags={maxTags}
            onTagAdd={onTagAdd}
            onTagRemove={onTagRemove}
            allowDuplicates={allowDuplicates ?? false}
            inlineTags={inlineTags}
            usePortal={usePortal}
            classStyleProps={{
              command: styleClasses?.autoComplete?.command,
              popoverTrigger: styleClasses?.autoComplete?.popoverTrigger,
              popoverContent: styleClasses?.autoComplete?.popoverContent,
              commandList: styleClasses?.autoComplete?.commandList,
              commandGroup: styleClasses?.autoComplete?.commandGroup,
              commandItem: styleClasses?.autoComplete?.commandItem,
            }}
          >
            {!usePopoverForTags ? (
              !inlineTags ? (
                <Input
                  ref={inputRef}
                  id={id}
                  type="text"
                  placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  {...inputProps}
                  className={cn(
                    'border-0 px-1 py-0 bg-transparent sm:min-w-focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 min-w-10 w-fit',
                    styleClasses?.input,
                  )}
                  autoComplete={enableAutocomplete ? 'on' : 'off'}
                  list={enableAutocomplete ? 'autocomplete-options' : undefined}
                  disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                />
              ) : (
                <div
                  className={cn(
                    `flex flex-row flex-wrap items-center gap-2 p-2 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                    styleClasses?.inlineTagsContainer,
                  )}
                >
                  <TagList
                    tags={truncatedTags}
                    customTagRenderer={customTagRenderer}
                    variant={variant}
                    size={size}
                    shape={shape}
                    borderStyle={borderStyle}
                    textCase={textCase}
                    interaction={interaction}
                    animation={animation}
                    textStyle={textStyle}
                    onTagClick={onTagClick}
                    draggable={draggable}
                    onSortEnd={onSortEnd}
                    onRemoveTag={removeTag}
                    direction={direction}
                    inlineTags={inlineTags}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    classStyleProps={{
                      tagListClasses: styleClasses?.tagList,
                      tagClasses: styleClasses?.tag,
                    }}
                    disabled={disabled}
                  />
                  <Input
                    ref={inputRef}
                    id={id}
                    type="text"
                    placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    {...inputProps}
                    className={cn(
                      'border-0 px-1 py-0 bg-transparent sm:min-w-focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 min-w-10 w-fit',
                      styleClasses?.input,
                    )}
                    autoComplete={enableAutocomplete ? 'on' : 'off'}
                    list={enableAutocomplete ? 'autocomplete-options' : undefined}
                    disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                  />
                </div>
              )
            ) : (
              <TagPopover
                tags={truncatedTags}
                customTagRenderer={customTagRenderer}
                variant={variant}
                size={size}
                shape={shape}
                borderStyle={borderStyle}
                textCase={textCase}
                interaction={interaction}
                animation={animation}
                textStyle={textStyle}
                onTagClick={onTagClick}
                draggable={draggable}
                onSortEnd={onSortEnd}
                onRemoveTag={removeTag}
                direction={direction}
                activeTagIndex={activeTagIndex}
                setActiveTagIndex={setActiveTagIndex}
                classStyleProps={{
                  popoverClasses: styleClasses?.tagPopover,
                  tagListClasses: styleClasses?.tagList,
                  tagClasses: styleClasses?.tag,
                }}
                disabled={disabled}
              >
                <Input
                  ref={inputRef}
                  id={id}
                  type="text"
                  placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  {...inputProps}
                  className={cn(
                    'border-0 px-1 py-0 bg-transparent sm:min-w-focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 min-w-10 w-fit',
                    styleClasses?.input,
                  )}
                  autoComplete={enableAutocomplete ? 'on' : 'off'}
                  list={enableAutocomplete ? 'autocomplete-options' : undefined}
                  disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                />
              </TagPopover>
            )}
          </Autocomplete>
        </div>
      ) : (
        <div className="w-full">
          {!usePopoverForTags ? (
            !inlineTags ? (
              <Input
                ref={inputRef}
                id={id}
                type="text"
                placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                {...inputProps}
                className={cn(
                  styleClasses?.input,
                )}
                autoComplete={enableAutocomplete ? 'on' : 'off'}
                list={enableAutocomplete ? 'autocomplete-options' : undefined}
                disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
              />
            ) : null
          ) : (
            <TagPopover
              tags={truncatedTags}
              customTagRenderer={customTagRenderer}
              variant={variant}
              size={size}
              shape={shape}
              borderStyle={borderStyle}
              textCase={textCase}
              interaction={interaction}
              animation={animation}
              textStyle={textStyle}
              onTagClick={onTagClick}
              draggable={draggable}
              onSortEnd={onSortEnd}
              onRemoveTag={removeTag}
              direction={direction}
              activeTagIndex={activeTagIndex}
              setActiveTagIndex={setActiveTagIndex}
              classStyleProps={{
                popoverClasses: styleClasses?.tagPopover,
                tagListClasses: styleClasses?.tagList,
                tagClasses: styleClasses?.tag,
              }}
              disabled={disabled}
            >
              <Input
                ref={inputRef}
                id={id}
                type="text"
                placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                {...inputProps}
                autoComplete={enableAutocomplete ? 'on' : 'off'}
                list={enableAutocomplete ? 'autocomplete-options' : undefined}
                disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                className={cn(
                  'border-0 w-full',
                  styleClasses?.input,
                )}
              />
            </TagPopover>
          )}
        </div>
      )}

      {showCount && maxTags && (
        <div className="flex">
          <span className="text-muted-foreground text-sm mt-1 ml-auto">
            {`${tagCount}`}/{`${maxTags}`}
          </span>
        </div>
      )}
      {clearAll && (
        <Button type="button" onClick={handleClearAll} className={cn('mt-2', styleClasses?.clearAllButton)}>
          Clear All
        </Button>
      )}
    </div>
  );
});

TagInput.displayName = 'TagInput';

export { TagInput };