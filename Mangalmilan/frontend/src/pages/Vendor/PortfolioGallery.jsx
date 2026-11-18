import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from "../../context/auth.jsx"; 
import apiClient from "../../api/apiClient";

const API_BASE_URL = '/api/portfolio';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

function PortfolioManager() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const vendorId = user?._id || user?.id;

  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [counts, setCounts] = useState({ imageCount: 0, videoCount: 0 });
  const [dragging, setDragging] = useState(false);

  const images = portfolioAssets.filter(a => a.resourceType?.toLowerCase() === 'image');
  const videos = portfolioAssets.filter(a => a.resourceType?.toLowerCase() === 'video');

  const getAuthConfig = () => ({ withCredentials: true });

  // Fetch portfolio
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_BASE_URL, getAuthConfig());
      setPortfolioAssets(res.data.data || []);
      setCounts({ imageCount: res.data.imageCount || 0, videoCount: res.data.videoCount || 0 });
    } catch {
      toast.error('Failed to fetch portfolio');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading && vendorId) fetchPortfolio();
  }, [vendorId, authLoading]);

  // Drag & Drop
  const handleDragOver = e => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragging(false); };
  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 15);
    setFiles(droppedFiles);
    setUploadProgress(0);
  };

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files).slice(0, 15);
    setFiles(selectedFiles);
    setUploadProgress(0);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleUpload = async e => {
    e.preventDefault();
    if (!files.length) return toast.warn('Select files first');

    const formData = new FormData();
    files.forEach(f => formData.append('assets', f));

    const toastId = toast.info('Uploading...', { autoClose: false, progress: 0 });
    try {
      setLoading(true);
      await apiClient.post(API_BASE_URL, formData, {
        ...getAuthConfig(),
        onUploadProgress: p => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setUploadProgress(percent);
          toast.update(toastId, { render: `Uploading: ${percent}%`, progress: percent/100 });
        }
      });
      toast.update(toastId, { render: 'Upload Successful! 🎉', type: 'success', autoClose: 4000, progress: 1 });
      setFiles([]); setUploadProgress(0); fetchPortfolio();
    } catch {
      toast.update(toastId, { render: 'Upload Failed', type: 'error', autoClose: 4000, progress: 1 });
    } finally { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete permanently?')) return;
    try { setLoading(true); await apiClient.delete(`${API_BASE_URL}/asset/${id}`, getAuthConfig()); fetchPortfolio(); toast.success('Deleted!'); } 
    finally { setLoading(false); }
  };

  const handleLike = async id => {
    try {
      const res = await apiClient.patch(`${API_BASE_URL}/like/${id}`, {}, getAuthConfig());
      setPortfolioAssets(prev => prev.map(a => a._id === id ? { ...a, likes: res.data.likes } : a));
    } catch { toast.error('Like failed'); }
  };

  const totalFileSize = files.reduce((acc,f)=>acc+f.size,0);

  if (authLoading) return <p style={{textAlign:'center',marginTop:'50px'}}>Loading...</p>;
  if (!vendorId) return <p style={{textAlign:'center',marginTop:'50px',color:'red'}}>Login as vendor to manage portfolio</p>;

  return (
    <div style={{padding:'20px',fontFamily:'sans-serif',background:'#f0f2f5',minHeight:'100vh'}}>
      <h1 style={{textAlign:'center',fontSize:'36px',marginBottom:'30px'}}>Portfolio Manager</h1>

      {/* Upload Section */}
      <section style={{background:'white',borderRadius:'20px',padding:'30px',marginBottom:'40px',boxShadow:'0 8px 25px rgba(0,0,0,0.1)'}}>
        <div 
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            padding:'50px',
            border:`3px dashed ${dragging?'#ff6b6b':'#ccc'}`,
            borderRadius:'15px',
            textAlign:'center',
            background:dragging?'#ffe3e3':'#fafafa',
            cursor:'pointer',
            marginBottom:'20px'
          }}
        >
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileChange} style={{display:'none'}}/>
          <p style={{fontSize:'20px'}}>{dragging?'Drop here!':'Click or drag files to upload'}</p>
        </div>

        {files.length>0 && (
          <div style={{marginBottom:'20px'}}>
            <p>{files.length} files selected ({formatBytes(totalFileSize)})</p>
            <div style={{background:'#e0e0e0',borderRadius:'10px',height:'8px'}}>
              <div style={{width:`${uploadProgress}%`,height:'100%',background:'#28a745',transition:'width 0.3s'}}></div>
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={loading || !files.length} style={{
          width:'100%',padding:'15px',border:'none',borderRadius:'15px',
          background:loading || !files.length?'#6c757d':'#28a745',color:'white',fontSize:'18px',cursor:loading||!files.length?'not-allowed':'pointer'
        }}>{loading?'Uploading...':'Upload Files'}</button>
      </section>

      {/* Image Section */}
      <PortfolioSection title="Images" assets={images} handleLike={handleLike} handleDelete={handleDelete} />

      {/* Video Section */}
      <PortfolioSection title="Videos" assets={videos} handleLike={handleLike} handleDelete={handleDelete} />
    </div>
  );
}

// Portfolio Section Component
const PortfolioSection = ({ title, assets, handleLike, handleDelete }) => (
  <section style={{marginBottom:'40px'}}>
    <h2 style={{marginBottom:'20px',fontSize:'28px'}}>{title} ({assets.length})</h2>
    {assets.length===0 ? <p>No assets uploaded.</p> :
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px'}}>
        {assets.map(asset=><AssetCard key={asset._id} asset={asset} handleLike={handleLike} handleDelete={handleDelete}/>)}
      </div>
    }
  </section>
);

// Asset Card
const AssetCard = ({ asset, handleLike, handleDelete }) => {
  const [hover, setHover] = useState(false);
  const isImage = asset.resourceType.toLowerCase()==='image';
  return (
    <div 
      style={{
        borderRadius:'15px',
        overflow:'hidden',
        boxShadow:hover?'0 12px 25px rgba(0,0,0,0.2)':'0 6px 15px rgba(0,0,0,0.1)',
        transition:'0.3s',
        background:'white',
        position:'relative'
      }}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
    >
      {isImage ? (
        <img src={asset.assetUrl} alt="" style={{width:'100%',height:'200px',objectFit:'cover'}}/>
      ):(
        <video src={asset.assetUrl} controls style={{width:'100%',height:'200px',objectFit:'cover'}} controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={e=>e.preventDefault()}/>
      )}
      <div style={{display:'flex',justifyContent:'space-between',padding:'10px'}}>
        
        <button onClick={()=>handleDelete(asset._id)} style={{background:'#dc3545',color:'white',border:'none',padding:'5px 10px',borderRadius:'8px',cursor:'pointer'}}>Delete</button>
      </div>
    </div>
  );
};

export default PortfolioManager;
