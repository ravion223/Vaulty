import { useState, useEffect } from 'react';
import { FiFilter } from "react-icons/fi";
import apiClient from '../api/client';
import { FiSearch } from "react-icons/fi"
import AddClientModal from '../components/AddClientModal';
import { IoIosSettings } from "react-icons/io";
import EditKycModal from '../components/EditKycModal';
import Table from '../components/Table';
import AccessGuard from '../components/AccessGuard';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    
    const [riskFilter, setRiskFilter] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [selectedClientForKyc, setSelectedClientForKyc] = useState(null);

    const [kycStatusFilter, setKycStatusFilter] = useState("");
    
    const columns = [
        {
            header: 'Client Info',
            className: 'pl-1 sm:pl-4',
            render: (client) => (
                <div className='flex flex-col items-end md:items-start min-w-0 w-full whitespace-normal'>
                    <div className="text-sm font-semibold text-mauve-900 text-right md:text-left w-full break-normal">
                        {client.first_name} {client.last_name}
                    </div>
                    <div className="text-xs text-mauve-500 mt-0.5 text-right md:text-left w-full break-all">
                        {client.email}
                    </div>
                </div>
            )
        },
        {
            header: 'Contact & Tax',
            className: 'pl-1 sm:pl-4 pr-4',
            render: (client) => (
                <div className='flex flex-col items-end md:items-start min-w-0 w-full whitespace-normal'>
                    <div className="text-sm text-mauve-800 font-medium text-right md:text-left w-full break-all">
                        {client.phone_number || "No phone"}
                    </div>
                    <div className="text-xs text-mauve-500 mt-0.5 text-right md:text-left w-full break-all">
                        TIN: {client.tax_number || "N/A"}
                    </div>
                </div>
            )
        },
        {
            header: 'KYC Status',
            className: 'pl-1 sm:pl-5 pr-4',
            render: (client) => (
                <>
                    <div className='flex justify-end md:justify-start items-center gap-0.5 w-full shrink-0'>
                        <span className='inline-flex items-center gap-2 justify-center w-28 px-2.5 py-1 rounded-full bg-mauve-600 text-mauve-50 text-[10px] font-bold tracking-wider uppercase shrink-0 shadow-sm border border-mauve-700/30'> 
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                            client.kyc_status === 'APPROVED' ? 'bg-emerald-400' :
                            client.kyc_status === 'PENDING' ? 'bg-amber-400' :
                            'bg-red-400'
                        }`} />
                            {client.kyc_status || 'PENDING'}
                        </span>
                        <AccessGuard permission="edit_kyc_status">
                            <button
                                onClick={() => { 
                                    setSelectedClientForKyc(client);
                                    setIsKycModalOpen(true); 
                                }}
                                className='text-mauve-500 text-lg hover:text-blue-600 transition-colors shrink-0'
                            >
                                <IoIosSettings />
                            </button>
                        </AccessGuard>
                    </div>
                </>
            )
        },
        {
            header: 'Risk level',
            className: 'pl-1 sm:pl-4 pr-4',
            render: (client) => (
                <>
                    <div className="flex justify-end md:justify-start items-center gap-2 w-full shrink-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                            client.risk_level === 'HIGH' ? 'bg-red-500' :
                            client.risk_level === 'MEDIUM' ? 'bg-amber-500' :
                            'bg-emerald-500'
                        }`}></div>
                        
                        <select
                            value={client.risk_level}
                            onChange={(e) => updateRiskLevel(client.id, e.target.value)}
                            className="bg-transparent text-sm font-medium text-mauve-700 cursor-pointer outline-none hover:text-blue-600 transition-colors"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                </>
            )
        },
        {
            header: 'Accounts',
            className: 'pl-1 sm:pl-4',
            render: (client) => (
                <div className='flex justify-end md:justify-start w-full shrink-0'>
                    <span className="text-sm font-medium text-mauve-600 bg-white border border-mauve-200 px-2.5 py-0.5 rounded-md">
                        {client.accounts?.length || 0}
                    </span>
                </div>
            )
        }
    ]

    useEffect(() =>{
        const fetchClients = async () => {
            setLoading(true);
            try {
                let url = `clients/?page=${page}`;
                if (riskFilter){
                    url += `&risk=${riskFilter}`;
                }
                
                if (searchQuery){
                    url += `&search=${searchQuery}`;
                }

                if (kycStatusFilter){
                    url += `&kyc_status=${kycStatusFilter}`
                }
                const response = await apiClient.get(url);
                setClients(response.data.results);

                setHasNext(response.data.next !== null);
                setHasPrevious(response.data.previous !== null);
            } catch (error) {
                console.error("Loading error", error)
            } finally {
                setLoading(false);
            }
        };
        
        const delayDebounceFn = setTimeout(() => {
            fetchClients();
        }, 500);

        return () => clearTimeout(delayDebounceFn)
    }, [page, riskFilter, searchQuery, kycStatusFilter]);

    const handleRiskFilter = (e) => {
        setRiskFilter(e.target.value);
        setPage(1);
    };

    const handleKycStatusFilter = (e) => {
        setKycStatusFilter(e.target.value);
        setPage(1);
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const updateRiskLevel = async (clientId, newRisk) => {
        try {
            await apiClient.patch(`clients/${clientId}/`, { risk_level: newRisk });

            setClients((prevClients) =>
                prevClients.map((client) =>
                    client.id === clientId ? { ...client, risk_level: newRisk } : client
                )
            );
        } catch (error){
            console.log("Error updating risk level: ", error);
            alert("Couldn't change risk level of client")
        }
    }

    const handleAddClient = async (clientData) => {
        try {
            const response = await apiClient.post('/clients/', clientData);
            setClients(prevClients => [response.data, ...prevClients]);
        } catch (error) {
            console.error("Failed to create new Client", error);
            alert("Error creating Client. Check console");
            // returns error to where function was called
            throw error;
        }
    }

    const updateKycStatus = async (clientId, newStatus) => {
        await apiClient.patch(`clients/${clientId}/`, { kyc_status: newStatus });
        setClients((prev) => 
            prev.map((client) => 
                client.id === clientId ? { ...client, kyc_status: newStatus } : client
            )
        )
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            {/* <div className="flex justify-between items-center"> */}
            <div className='flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6 w-full'>
                <div className='flex items-center justify-between lg:justify-start gap-4 w-full lg:w-auto shrink-0'>
                    <h2 className="text-xl font-bold text-mauve-900">
                        Bank clients
                    </h2>
                    {!loading && clients.length !== 0 && (
                        <AccessGuard permission="create_client">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-mauve-700 hover:bg-mauve-600 text-indigo-50 text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-sm whitespace-nowrap cursor-pointer"
                            >
                                + Add Client
                            </button>
                        </AccessGuard>
                    )}
                    
                </div>
                
                <div className='flex flex-col lg:grid-cols-2 xl:flex-row gap-4 w-full lg:flex-1 lg:justify-between items-stretch sm:items-center lg:pl-12 xl:pl-32'>
                    <div className="relative w-full sm:w-72 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-mauve-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-mauve-300 rounded-xl text-xs text-mauve-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-mauve-400"
                        />
                    </div>
                    
                    <div className='flex items-center gap-3 w-full justify-end shrink-0 sm:w-auto'>
                        <div className="flex flex-1 sm:flex-none items-center gap-2 min-w-110px">
                            <FiFilter className="text-mauve-400 shrink-0 hidden sm:inline" />
                            <span className="text-xs font-mono font-bold text-mauve-400 uppercase tracking-wider">Risk:</span>
                            <select
                            value={riskFilter}
                            onChange={handleRiskFilter}
                            className="w-full bg-white border border-mauve-200 text-mauve-700 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 outline-none cursor-pointer hover:bg-mauve-50 transition duration-300">
                                <option value="">All</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="flex flex-1 sm:flex-none items-center gap-2 min-w-140px">
                            <FiFilter className="text-mauve-400 shrink-0 hidden sm:inline" />
                            <span className="text-xs font-mono text-mauve-400 uppercase tracking-wider whitespace-nowrap">KYC:</span>
                            <select
                                value={kycStatusFilter}
                                onChange={handleKycStatusFilter}
                                className="w-full bg-white border border-mauve-200 text-mauve-700 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 outline-none cursor-pointer hover:bg-mauve-50 transition duration-300">
                                <option value="">All</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                            </select>
                        </div>
                    </div>
                        
                    </div>
                </div>
                
            <div className='w-full'>
                <Table 
                    columns={columns} 
                    data={clients}
                    loading={loading}
                    page={page}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    onNext={() => setPage((prev) => prev + 1)}
                    onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
                />
            </div>
            
            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddClient} 
            />
            <EditKycModal
                isOpen={isKycModalOpen}
                onClose={() => setIsKycModalOpen(false)}
                client={selectedClientForKyc}
                onUpdate={updateKycStatus}
            />
        </div>
    )
}

export default Clients;