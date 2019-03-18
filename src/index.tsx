import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Row, Col, Navbar, Form, Container } from 'react-bootstrap';
import "./index.css";
import * as moment from 'moment';

const leftPad = (n: number, length: number = 2, char: string = "0") => {
    let num = n.toString();
    const pad = length - num.length;
    if (pad < 1)
        return num;
    for (let i = 0; i < pad; i++) {
        num = char + num;
    }
    return num;
}

interface AppState {
    itemsOwned: string;
    itemsNeeded: string;
    attackSpeed: string;
    dropModifier: string;
    timeLeft: string;
    dueTime?: number;
}

export class App extends React.Component<{}, AppState> {
    constructor(props: any) {
        super(props);

        this.state = this.getSave();
        setInterval(() => {
            this.timerTick();
        }, 1000);
    }

    timerTick = () => {
        if (this.state.dueTime) {
            const now = new Date();
            const diff = this.state.dueTime - now.getTime();

            if (diff <= 0) {
                const timeLeft = "00:00:00";
                document.title = timeLeft;
                this.setState({ timeLeft, dueTime: undefined });
                const audio = document.getElementById("audio") as HTMLAudioElement;
                audio.play();
            }
            else {
                const d = moment.duration(diff);
                const timeLeft = `${leftPad(d.hours())}:${leftPad(d.minutes())}:${leftPad(d.seconds())}`;
                document.title = timeLeft;
                this.setState({ timeLeft });
            }
        }
    }

    getSave() {
        const saved = localStorage.getItem("save");
        if (!saved) {
            return {
                itemsOwned: "0",
                itemsNeeded: "50",
                attackSpeed: "4",
                dropModifier: "100"
            }
        }

        return JSON.parse(saved);
    }

    updateTime() {
        const itemsNeeded = parseFloat(this.state.itemsNeeded) - parseFloat(this.state.itemsOwned);
        const dropChance = 0.05 * (parseFloat(this.state.dropModifier) / 100);
        const killsNeeded = itemsNeeded / dropChance;
        const timeNeededSeconds = killsNeeded * (parseFloat(this.state.attackSpeed) + 0.8);
        const dueTime = new Date().getTime() + (timeNeededSeconds * 1000)
        this.setState({ dueTime });
    }

    onChanged = () => {
        localStorage.setItem("save", JSON.stringify(this.state));
        this.updateTime();
    }

    changeDropModifier = (event: React.FormEvent<any>) => {
        const dropModifier = event.currentTarget.value;
        this.setState({ dropModifier }, () => {
            this.onChanged();
        });
    }
    changeAttack = (event: React.FormEvent<any>) => {
        const attackSpeed = event.currentTarget.value;
        this.setState({ attackSpeed }, () => {
            this.onChanged();
        });
    }
    changeOwned = (event: React.FormEvent<any>) => {
        const itemsOwned = event.currentTarget.value;
        this.setState({ itemsOwned }, () => {
            this.onChanged();
        });
    }
    changeNeeded = (event: React.FormEvent<any>) => {
        const itemsNeeded = event.currentTarget.value;
        this.setState({ itemsNeeded }, () => {
            this.onChanged();
        });
    }

    render() {
        return (
            <div>
                <Navbar bg="dark" variant="dark">
                    <Navbar.Brand>
                        NGU Quest Calculator
                    </Navbar.Brand>
                </Navbar>
                <Container>
                    <Row>
                        <Col xs={6}>
                            <Form.Group controlId="itemsHave">
                                <Form.Label>Items I Have</Form.Label>
                                <Form.Control type="number" placeholder="#" value={this.state.itemsOwned} onChange={this.changeOwned} />
                            </Form.Group>
                            <Form.Group controlId="itemsNeed">
                                <Form.Label>Items I Need</Form.Label>
                                <Form.Control type="number" placeholder="#" value={this.state.itemsNeeded} onChange={this.changeNeeded} />
                            </Form.Group>
                            <Form.Group controlId="attackSpeed">
                                <Form.Label>Total Respawn Rate (seconds)</Form.Label>
                                <Form.Control type="number" placeholder="seconds" value={this.state.attackSpeed} onChange={this.changeAttack} />
                            </Form.Group>
                            <Form.Group controlId="dropMod">
                                <Form.Label>Quest Item Drop Modifier (%)</Form.Label>
                                <Form.Control type="number" placeholder="percent" value={this.state.dropModifier} onChange={this.changeDropModifier} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <div><span>Time left:&nbsp;</span><span>{this.state.timeLeft}</span></div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}


ReactDOM.render(
    <App />,
    document.getElementById('react'));