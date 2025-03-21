import React, { memo, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { ImagePlaceholder } from '../ui/Iimage-placeholder';
import { AppTooltip } from '@/common/AppTooltip';
import { Chip } from '../ui/chip';
import { cn } from '@/lib/utils';
import { PlusCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import { useOrder } from '@/contexts/order-management-context';
import { useMenuStyles } from './utils';
import { Badge } from '../ui/badge';


const StatusBadge = memo(({ type }) => {
    return (
        <AppTooltip content={type === "veg" ? "Veg" : "Non Veg"} >
            <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
                <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
            </Chip>
        </AppTooltip>
    )
})

const OptimizedImage = memo(({ src, alt }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '150px',
    });

    return (
        <div ref={ref} className="w-full h-56 rounded-lg overflow-hidden">
            {(inView && src) ? (
                <LazyLoadImage
                    src={src}
                    alt={alt || 'Menu item'}
                    effect="blur"
                    className="w-full h-full object-cover"
                    wrapperClassName="w-full h-full"
                    placeholderSrc="/placeholder.jpg"
                    loading="lazy"
                />
            ) : (
                <ImagePlaceholder />
            )}
        </div>
    );
});

const MenuItem = memo(({ item, styles }) => {

    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '100px 0px',
    });

    const { addItem, removeItem, orderItems } = useOrder();

    const isInStock = item.availability === 'in_stock';
    const itemInOrder = orderItems.find(orderItem => orderItem.id === item.id || orderItem.unique_id === item.unique_id);


    const handleAddToOrder = () => {
        if (isInStock) {
            addItem({
                id: item.id,
                unique_id: item.unique_id,
                name: item.name,
                price: parseFloat(item.price),
                veg_status: item.veg_status,
                image: item.image_details?.url
            });
        }
    };

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card style={styles?.cardStyle} className="flex flex-col justify-between overflow-hidden h-full relative group">
                    <div className='absolute top-2 right-2 z-[1]' >
                        <StatusBadge type={item?.veg_status} />
                    </div>

                    {/* {itemInOrder && (
                        <div className="absolute top-2 left-2 z-[1]">
                            <Badge variant="primary" className="bg-primary text-primary-foreground">
                                {itemInOrder.quantity} in order
                            </Badge>
                        </div>
                    )} */}

                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} />

                    <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
                        <div className="flex flex-col gap-1">
                            <CardTitle style={styles?.titleStyle} className="text-lg text-primary">
                                {item?.name}
                            </CardTitle>
                            <CardDescription style={styles?.descriptionStyle} className="text-secondary line-clamp-2">
                                {item?.description}
                            </CardDescription>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span style={styles?.titleStyle} className="text-base font-bold">
                                ${item?.price}
                            </span>
                            {
                                !!itemInOrder ?

                                    (<div className='flex items-center gap-x-1' >
                                        <Button
                                            disabled={!isInStock}
                                            style={styles?.buttonBackgroundStyle}
                                            variant='primary'
                                            size='icon'
                                            onClick={() => removeItem(item)}
                                            className="flex items-center gap-1"
                                        >
                                            <p style={styles?.buttonLabelStyle} >
                                                <Minus size={14} />
                                            </p>
                                        </Button>

                                        <Chip className='gap-1 w-8 h-8  bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={'gray'}>
                                            {itemInOrder.quantity}
                                        </Chip>
                                        <Button
                                            disabled={!isInStock}
                                            style={styles?.buttonBackgroundStyle}
                                            variant='primary'
                                            size='icon'
                                            onClick={handleAddToOrder}
                                            className="flex items-center gap-1"
                                        >
                                            <p style={styles?.buttonLabelStyle}  >
                                                <Plus size={14} />
                                            </p>
                                        </Button>


                                    </div>)

                                    : (

                                        <Button
                                            disabled={!isInStock}
                                            style={styles?.buttonBackgroundStyle}
                                            variant='primary'
                                            size='sm'
                                            onClick={handleAddToOrder}
                                            className="flex items-center gap-1"
                                        >
                                            <p style={styles?.buttonLabelStyle} className='flex items-center gap-1' >
                                                {isInStock ? (
                                                    <><PlusCircle className="h-4 w-4" />Add</>
                                                ) : (
                                                    <><AlertCircle className="h-4 w-4" />Out of Stock</>
                                                )}
                                            </p>
                                        </Button>
                                    )
                            }

                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
            )}
        </div>
    );

});

const CategoryAccordion = memo(({ category, globalConfig }) => {

    const categoryId = category.id || category.unique_id || category.name;
    const categoryStyle = category?.style || {};

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '300px 0px',
        triggerOnce: true,
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (inView && !isLoaded) {
            setIsLoaded(true);
        }
    }, [inView, isLoaded]);

    const styles = useMenuStyles(globalConfig, categoryStyle);

    return (
        <Card
            key={categoryId}
            value={categoryId}
            className={cn('bg-card md:rounded-md rounded overflow-hidden border-none md:px-3 px-1')}
            style={styles?.sectionStyle}
            id={categoryId}
            ref={ref}
        >
            <CardHeader className="py-3 px-2 hover:no-underline">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block" style={styles?.titleBarStyle} />
                    <h2 style={styles?.titleTextStyle} className="text-xl font-semibold">
                        {category?.name}
                    </h2>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                {(inView || isLoaded) ? (
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4">
                        {
                            category?.items?.filter(item => item?.visible)?.length > 0 ? category?.items?.filter(item => item?.visible).map(item => (
                                <MenuItem
                                    key={item.unique_id || item.id}
                                    item={item}
                                    styles={{
                                        cardStyle: styles.cardStyle,
                                        titleStyle: styles.titleStyle,
                                        descriptionStyle: styles.descriptionStyle,
                                        buttonBackgroundStyle: styles.buttonBackgroundStyle,
                                        buttonLabelStyle: styles.buttonLabelStyle,
                                    }}
                                />
                            )) : <p className='flex items-center justify-center h-20 font-semibold text-lg w-full lg:col-span-3 md:col-span-2 col-span-1' >No Item Available</p>
                        }
                    </div>
                ) : (
                    <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                )}
            </CardContent>
        </Card>
    );
});

export default function CustomerMenuViewer({ menuConfig }) {

    const categories = menuConfig?.categories || [];
    const globalFromConfig = menuConfig?.global || {};

    const globalConfig = useMemo(() => ({
        background_color: globalFromConfig.background_color,
        section_background_color: globalFromConfig.section_background_color,
        title_color: globalFromConfig.title_color,
        card_title_color: globalFromConfig.card_title_color,
        card_background_color: globalFromConfig.card_background_color,
        description_color: globalFromConfig.description_color,
        button_label_color: globalFromConfig.button_label_color,
        button_background_color: globalFromConfig.button_background_color,
    }), [globalFromConfig.background_color, globalFromConfig.section_background_color, globalFromConfig.title_color, globalFromConfig.card_title_color, globalFromConfig.card_background_color, globalFromConfig.description_color, globalFromConfig.button_label_color, globalFromConfig.button_background_color]
    );

    const visibleCategories = useMemo(() => categories.filter(category => category?.visible), [categories]);

    const containerStyle = useMemo(() => (globalConfig?.background_color ? { backgroundColor: globalConfig.background_color } : {}), [globalConfig?.background_color]);



    return (
        <div className="md:p-4 p-2 bg-gray-100/90 min-h-[100dvh] max-h-[100dvh] overflow-auto space-y-4" style={containerStyle}>
            {visibleCategories.map(category => (
                <CategoryAccordion
                    key={category.id || category.unique_id || category.name}
                    globalConfig={globalConfig}
                    category={category}
                />
            ))}
        </div>
    )
}
