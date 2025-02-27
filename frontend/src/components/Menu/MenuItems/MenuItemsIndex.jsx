import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List, Plus } from 'lucide-react'
import React, { useCallback, useState, memo } from 'react'
import MenuCard from './MenuCard'
import MenuTable from './MenuTable'
import MenuItemForm from './MenuItemForm'

// Memoize the header component to prevent unnecessary re-renders
const Header = memo(({ onAddClick }) => (
  <div className="px-2 my-2 flex justify-between items-center border-b">
    <h2 className="text-2xl font-medium">Menu Items</h2>
    <div className="flex items-center gap-2">
      <Button
        onClick={onAddClick}
        size="sm"
        className="text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
      >
        <div className="flex items-center gap-1">
          <Plus size={18} />
          <span className="text-sm">Add Menu Item</span>
        </div>
      </Button>
      <Separator orientation="vertical" className="h-8 bg-gray-300" />
      <TabsList className="bg-muted rounded-md p-1">
        <TabsTrigger value="table-view" className="p-1.5">
          <List size={20} />
        </TabsTrigger>
        <Separator orientation="vertical" className="h-6 bg-gray-300" />
        <TabsTrigger value="card-view" className="p-1.5">
          <LayoutGrid size={20} />
        </TabsTrigger>
      </TabsList>
    </div>
  </div>
));

// Memoize the content components
const MemoizedMenuTable = memo(MenuTable);
const MemoizedMenuCard = memo(MenuCard);

export default function MenuItemsIndex() {
  const [isModalOpen, setIsModalOpen] = useState({ isOpen: false, isEdit: false, data: null });
  const [activeTab, setActiveTab] = useState("table-view");

  const handleModalClose = useCallback(() => {
    setIsModalOpen((prv) => ({ ...prv, isOpen: false, isEdit: false, data: null }));
  }, []);

  const handleAddMenuItem = useCallback(() => {
    setIsModalOpen((prv) => ({ ...prv, isOpen: true, isEdit: false, data: null }));
  }, []);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="w-full">
      <MenuItemForm
        open={isModalOpen?.isOpen}
        isEdit={isModalOpen?.isEdit}
        selectedRow={isModalOpen?.data}
        onHide={handleModalClose}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        defaultValue="table-view"
      >
        <Header onAddClick={handleAddMenuItem} />

        {/* Render content conditionally based on active tab */}
        {activeTab === "table-view" && (
          <TabsContent value="table-view" forceMount>
            <MemoizedMenuTable setIsModalOpen={setIsModalOpen} />
          </TabsContent>
        )}

        {activeTab === "card-view" && (
          <TabsContent value="card-view" forceMount className="px-2">
            <MemoizedMenuCard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}