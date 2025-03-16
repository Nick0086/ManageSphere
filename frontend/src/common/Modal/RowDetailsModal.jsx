import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/tremor-dialog";


const RowDetailsModal = ({ isOpen, onClose, data, style, title, isLoading }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent className="sm:max-w-md" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                {
                    isOpen && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{title}</DialogTitle>
                            </DialogHeader>

                            <DialogDescription>
                                {isLoading ? <div className="flex items-center justify-center">
                                    <div className="2 mr-2 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin animate-infinite h-5 w-5"></div>
                                    <div className="text-gray-600 text-sm">Loading...</div>
                                </div> :

                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(data).map(([key, value]) => {
                                            let displayValue = value;
                                            if (typeof value === 'object' && value !== null) {
                                                displayValue = JSON.stringify(value, null, 2);
                                            }
                                            return (
                                                <div className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200" key={key}>
                                                    <div className="flex gap-2">
                                                        <div className=" text-gray-700 font-bold text-sm whitespace-nowrap">
                                                            {key} :
                                                        </div>
                                                        <div className=" text-gray-700 text-sm break-all">
                                                            {displayValue}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>}
                            </DialogDescription>
                        </>
                    )
                }
            </DialogContent>
        </Dialog>
    )
}

export default RowDetailsModal