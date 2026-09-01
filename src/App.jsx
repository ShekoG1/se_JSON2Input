import './App.css';
import JSON2Input from './modules/json2input';

function App() {

    const testData = {
        name: "BLAH",
        phones: ["000", "000"],
        address: ""
    };

    const form = new JSON2Input(testData);

    const handleGetData = () => {
        console.log(form.getData());
    };

    return (
        <div className="App">
            <div style={{ padding: '200px' }}>

                {form.render()}

                <button
                    type="button"
                    onClick={handleGetData}
                >
                    Get Data
                </button>

            </div>
        </div>
    );
}

export default App;