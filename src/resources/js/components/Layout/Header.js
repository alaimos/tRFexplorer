import React, { Component }               from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import {
    Container,
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
}                                         from 'reactstrap';

const MyLink = ({ href, children, ...props }) => {
    return <Link to={href} {...props} >{children}</Link>;
};

const MyNavLink = ({ href, children, ...props }) => {
    return <RouterNavLink to={href} {...props}>{children}</RouterNavLink>;
};

export default class Header extends Component {
    constructor (props) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    };

    render () {
        return <header>
            <Navbar color="dark" dark expand="md" fixed="top">
                <Container>
                    <NavbarBrand href="/" tag={MyLink}>tRFexplorer</NavbarBrand>
                    <NavbarToggler onClick={this.toggle}/>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="/browse" tag={MyNavLink}>Browse</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/de-analysis" tag={MyNavLink}>Diff. Exp. Analysis</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/correlation-analysis" tag={MyNavLink}>Correlation Analysis</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/download" tag={MyNavLink}>Download</NavLink>
                            </NavItem>
                            <UncontrolledDropdown nav inNavbar>
                                <DropdownToggle nav caret>
                                    <i className="fas fa-question-circle"/>
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem href="/help" tag={MyNavLink}>Help</DropdownItem>
                                    <DropdownItem href="/contactus" tag={MyNavLink}>Contact Us</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Nav>
                    </Collapse>
                </Container>
            </Navbar>
        </header>;
    }
}
