function RangeInput({ label,  setMin, setMax, minLimit, maxLimit }) {

    return (
        <div className="pmp4-section">
            <div className="pmp4-label">{label}</div>
            <div className="form-row">
              <input type="number" placeholder={`최소 (${minLimit})`} min={minLimit} max={maxLimit} className="pmp4-select" onChange={(e) => {const val = e.target.value; setMin(val === '' ? null : Number(val))}}/>
                <span className="pmp4-label">~</span>
              <input type="number" placeholder={`최대 (${maxLimit})`} min={minLimit} max={maxLimit} className="pmp4-select" onChange={(e) => {const val = e.target.value; setMax(val === '' ? null : Number(val))}}/>
            </div>
        </div>
    );
};

export { RangeInput };