import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cloud, Save, FolderOpen, Copy, Check, Loader2, FileJson, AlertCircle, X } from 'lucide-react';

export default function PersistenceManager({ characterData, onResumeData, onClose }) {
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [lastSavedCode, setLastSavedCode] = useState(localStorage.getItem('lastAnimusCode') || '');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ANIMUS-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let code = lastSavedCode;
      let isUpdate = true;

      if (!code) {
        code = generateCode();
        isUpdate = false;
      }

      const { data, error: supabaseError } = await supabase
        .from('fichas')
        .upsert({
          nome: characterData.name || 'Sem Nome',
          dados: characterData,
          codigo_acesso: code
        }, { onConflict: 'codigo_acesso' })
        .select();

      if (supabaseError) throw supabaseError;

      setLastSavedCode(code);
      localStorage.setItem('lastAnimusCode', code);
      setSuccess(`Ficha salva com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar no banco de dados. Verifique sua conexão ou as configurações do Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!accessCode) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('fichas')
        .select('dados')
        .eq('codigo_acesso', accessCode.toUpperCase().trim())
        .single();

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Código não encontrado.');
        }
        throw supabaseError;
      }

      if (data && data.dados) {
        onResumeData(data.dados);
        setLastSavedCode(accessCode.toUpperCase().trim());
        localStorage.setItem('lastAnimusCode', accessCode.toUpperCase().trim());
        
        // Short delay then close
        setSuccess('Ficha carregada com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
      setError(err.message || 'Erro ao carregar a ficha.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lastSavedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `animus_${characterData.name || 'ficha'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="persistence-manager glass-panel modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <Cloud size={20} className="text-accent" />
            <h3 className="panel-title">Sincronização em Nuvem</h3>
          </div>
          <button className="secondary icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="persistence-content">
          <div className="save-section">
            <div className="section-label">SALVAR NA NUVEM</div>
            <p className="section-desc">Gera um código único para você carregar esta ficha em qualquer lugar.</p>
            
            <div className="action-row">
              <button 
                className="primary flex-1" 
                onClick={handleSave} 
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {lastSavedCode ? 'Atualizar na Nuvem' : 'Salvar na Nuvem'}
              </button>
              <button className="secondary" onClick={exportJSON} title="Exportar JSON Local">
                <FileJson size={18} />
              </button>
            </div>

            {lastSavedCode && (
              <>
                <div className="last-code-badge">
                  <span>Seu Código: <strong>{lastSavedCode}</strong></span>
                  <button className="icon-btn" onClick={copyToClipboard}>
                    {copySuccess ? <Check size={14} className="text-earth" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="warning-badge" style={{ marginTop: '0.8rem' }}>
                  <AlertCircle size={14} />
                  <span><strong>Importante:</strong> Guarde este código! Ele é a única forma de recuperar sua ficha futuramente.</span>
                </div>
              </>
            )}
          </div>

          <div className="divider-h"></div>

          <div className="load-section">
            <div className="section-label">CARREGAR DA NUVEM</div>
            <div className="input-with-button">
              <input 
                type="text" 
                className="input-field flex-1" 
                placeholder="Digite o código (ex: ANIMUS-XXXXXX)"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <button 
                className="secondary" 
                onClick={handleLoad}
                disabled={loading || !accessCode}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <FolderOpen size={18} />}
                Carregar
              </button>
            </div>
          </div>

          {error && (
            <div className="error-badge animate-pulse">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-badge">
              <Check size={14} />
              <span>{success}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

